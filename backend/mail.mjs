import { categoryName, contactEmail } from "./categories.mjs";
import nodemailer from "nodemailer";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { id, now } from "./db.mjs";
import {
  fail,
  text,
  emailValid,
  templateData,
  personalize,
  escapeHtml,
} from "./validation.mjs";
import { listRecords, applicationSelect, studentSelect } from "./records.mjs";
const env = typeof process === "undefined" ? {} : process.env;
export function secretKey(key) {
  let bytes;
  try {
    bytes = Buffer.from(key || "", "base64");
  } catch {}
  if (bytes?.length !== 32)
    fail(
      "Configure a 32-byte base64 SMTP_ENCRYPTION_KEY on the server before saving an SMTP password.",
      503,
    );
  return bytes;
}
export function encrypt(value, key) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", secretKey(key), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), ciphertext]
    .map((b) => b.toString("base64"))
    .join(".");
}
export function decrypt(value, key) {
  const [iv, tag, data] = value.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", secretKey(key), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}
export function smtpPublic(store, options = {}) {
  const config = store.setting("smtp", {});
  const { encryptedPassword, ...safe } = config;
  return {
    ...safe,
    passwordSaved: !!encryptedPassword,
    configured: !!(
      config.host &&
      config.senderEmail &&
      config.username &&
      encryptedPassword
    ),
    sendingEnabled: options.allowSend === true,
  };
}
export function saveSmtp(store, input, actor, key = env.SMTP_ENCRYPTION_KEY) {
  const previous = store.setting("smtp", {}),
    config = {};
  for (const field of [
    "host",
    "username",
    "senderName",
    "senderEmail",
    "replyTo",
    "testRecipient",
  ])
    config[field] = text(input[field] || "", 254);
  config.port = Number(input.port);
  config.encryption = input.encryption;
  if (
    !/^[a-zA-Z0-9.-]+$/.test(config.host) ||
    !config.username ||
    !config.senderName ||
    !emailValid(config.senderEmail) ||
    (config.replyTo && !emailValid(config.replyTo)) ||
    (config.testRecipient && !emailValid(config.testRecipient))
  )
    fail("Enter a valid SMTP host, username, sender, and email addresses.");
  if (
    !Number.isInteger(config.port) ||
    config.port < 1 ||
    config.port > 65535 ||
    !["TLS", "STARTTLS"].includes(config.encryption)
  )
    fail("Choose a valid port and TLS or STARTTLS encryption.");
  if (input.password) {
    if (typeof input.password !== "string" || input.password.length > 1024)
      fail("Invalid SMTP password.");
    const password = input.password;
    config.encryptedPassword = encrypt(password, key);
  } else config.encryptedPassword = previous.encryptedPassword;
  if (!config.encryptedPassword)
    fail("An SMTP password is required for the initial configuration.");
  store.set("smtp", config);
  store.audit(actor, "Updated SMTP configuration", "settings", "smtp", {
    passwordChanged: !!input.password,
  });
  return smtpPublic(store);
}
export function transport(
  store,
  {
    key = env.SMTP_ENCRYPTION_KEY,
    transportFactory = nodemailer.createTransport,
  } = {},
) {
  const config = store.setting("smtp", {});
  if (!config.host || !config.encryptedPassword)
    fail("SMTP is not configured.", 503);
  const password = decrypt(config.encryptedPassword, key);
  return transportFactory({
    host: config.host,
    port: config.port,
    secure: config.encryption === "TLS",
    requireTLS: true,
    auth: { user: config.username, pass: password },
    tls: { rejectUnauthorized: false, minVersion: "TLSv1.2" },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    logger: false,
    debug: false,
  });
}
export const safeMailError = (error) => {
  const detail = error?.message ? `: ${error.message}` : "";
  const messages = {
    EAUTH: "SMTP authentication failed. Check username and password" + detail,
    ECONNECTION: "Could not connect to the SMTP server" + detail,
    ETIMEDOUT: "The SMTP connection timed out" + detail,
    ESOCKET: "SMTP connection or certificate validation failed" + detail,
    EENVELOPE: "SMTP rejected a sender or recipient address" + detail,
    EMESSAGE: "SMTP did not accept this message" + detail,
  };
  return (
    messages[error?.code] ||
    error?.message ||
    "SMTP operation failed. Check the configuration or contact your provider."
  );
};
export function templateVars(store, record) {
  return {
    first_name:
      record.preferred_name || record.full_name?.split(/\s+/)[0] || "Student",
    full_name: record.full_name || "Student",
    application_reference: record.reference || "Not yet assigned",
    student_id: record.student_number || "Not yet assigned",
    student_number: record.student_number || "Not yet assigned",
    registration_category: categoryName(
      record.registration_category || record.category,
    ),
    enrollment_year: record.enrollment_year
      ? String(record.enrollment_year)
      : "Not yet enrolled",
    course_name:
      record.course_name || record.course_id || "Your selected course",
    intake:
      (record.registration_category || record.category) === "visa"
        ? record.intake_name || record.intake_id || "To be confirmed"
        : "",
    institute_name: store.setting("institute").name,
  };
}
export function emailFrame(store, html, unsubscribeUrl = "") {
  const institute = store.setting("institute");
  const logo = (institute.logoUrl || "").startsWith("https://")
    ? '<img src="' +
      escapeHtml(institute.logoUrl) +
      '" alt="' +
      escapeHtml(institute.name) +
      '" width="150" style="max-width:150px;height:auto;display:block">'
    : '<span style="font-size:27px;letter-spacing:5px;color:#a91f35;font-weight:700">TOMONI</span>';
  const styles = {
    h1: "margin:0 0 20px;font-size:28px;line-height:1.3;color:#202b36;letter-spacing:-0.5px",
    h2: "margin:24px 0 12px;font-size:22px;line-height:1.4;color:#202b36",
    h3: "margin:22px 0 10px;font-size:18px;color:#202b36",
    p: "margin:0 0 18px;line-height:1.75",
    a: "color:#a91f35;text-decoration:underline",
    table:
      "width:100%;border-collapse:collapse;margin:24px 0;background:#faf7f5;border:1px solid #e8e2dd",
    td: "padding:13px 16px;border-bottom:1px solid #e8e2dd;line-height:1.6",
    th: "padding:13px 16px;text-align:left;border-bottom:1px solid #e8e2dd;color:#5b626c;font-size:13px",
    blockquote:
      "margin:24px 0;padding:18px 20px;border-left:3px solid #a91f35;background:#faf7f5",
    ul: "padding-left:22px;margin:16px 0 24px;line-height:1.8",
    ol: "padding-left:22px;margin:16px 0 24px;line-height:1.8",
  };
  // Content has already been sanitized; presentation styles are supplied by the server.
  const content = html.replace(
    /<(h1|h2|h3|p|a|table|td|th|blockquote|ul|ol)(\s[^>]*|)>/gi,
    (_, tag, attrs) =>
      "<" + tag + attrs + ' style="' + styles[tag.toLowerCase()] + '">',
  );
  const contacts = [institute.address, institute.phone]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
  const email =
    institute.email && emailValid(institute.email)
      ? '<br><a href="mailto:' +
        escapeHtml(institute.email) +
        '" style="color:#a91f35">' +
        escapeHtml(institute.email) +
        "</a>"
      : "";
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    escapeHtml(institute.name) +
    '</title><style>@media screen and (max-width:600px){.email-space{padding:16px 8px!important}.email-body{padding:28px 22px!important}.email-header{padding:26px 22px!important}}</style></head><body style="margin:0;padding:0;background:#f3f0ec;font-family:Arial,Helvetica,sans-serif;color:#444d58;font-size:15px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tr><td class="email-space" align="center" style="padding:40px 16px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e8e2dd;border-radius:12px;overflow:hidden"><tr><td class="email-header" style="padding:30px 36px;border-top:5px solid #a91f35;border-bottom:1px solid #eee8e3">' +
    logo +
    '<p style="margin:10px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#77716c">Japanese Language Institute</p></td></tr><tr><td class="email-body" style="padding:36px;line-height:1.75">' +
    content +
    '</td></tr><tr><td style="padding:24px 30px;background:#faf8f6;border-top:1px solid #eee8e3;font-size:12px;line-height:1.8;color:#77716c"><strong style="color:#414852">' +
    escapeHtml(institute.name) +
    "</strong>" +
    (contacts ? "<br>" + contacts : "") +
    email +
    (unsubscribeUrl
      ? '<p style="margin:12px 0 0"><a href="' +
        escapeHtml(unsubscribeUrl) +
        '" style="color:#77716c">Unsubscribe from promotional emails</a></p>'
      : "") +
    '</td></tr></table><p style="margin:20px 0 0;font-size:11px;color:#8a847e">Learning Japanese. Building your future.</p></td></tr></table></body></html>'
  );
}
export function resolveRecipients(store, selection, kind) {
  if (!selection || typeof selection !== "object") fail("Choose recipients.");
  let records = [];
  const source = selection.source === "students" ? "students" : "applications";
  if (selection.mode === "selected") {
    if (!Array.isArray(selection.ids) || selection.ids.length > 500)
      fail("Select at most 500 records.");
    for (const recordId of new Set(selection.ids)) {
      const record =
        source === "students"
          ? store.one(studentSelect + " WHERE s.id=?", recordId)
          : store.one(
              applicationSelect + " WHERE a.id=? AND a.archived_at IS NULL",
              recordId,
            );
      if (record) records.push({ ...record, source });
    }
  } else if (["filtered", "all"].includes(selection.mode)) {
    const params = new URLSearchParams(
      selection.mode === "all" ? {} : selection.filters || {},
    );
    const result = listRecords(store, params, source === "students", true);
    if (result.total > 10000)
      fail("Narrow the recipient filters to fewer than 10,000 records.");
    records = result.rows.map((r) => ({ ...r, source }));
  } else fail("Choose a valid recipient selection.");
  const unique = new Map(),
    excluded = [];
  for (const record of records) {
    const address = contactEmail(record)?.trim().toLowerCase();
    const globalOptOut =
      store.one(
        "SELECT id FROM students WHERE email=? AND unsubscribed=1",
        address || "",
      ) ||
      store.one(
        "SELECT id FROM applications WHERE email=? AND unsubscribed=1",
        address || "",
      );
    if (!emailValid(address)) {
      excluded.push({
        name: record.full_name,
        reason: "Missing or invalid email",
      });
      continue;
    }
    if (
      kind === "promotional" &&
      (!record.promotional_consent || record.unsubscribed || globalOptOut)
    ) {
      excluded.push({
        name: record.full_name,
        reason: "No promotional consent or unsubscribed",
      });
      continue;
    }
    if (unique.has(address)) {
      excluded.push({
        name: record.full_name,
        reason: "Duplicate email address",
      });
      continue;
    }
    unique.set(address, { ...record, email: address });
  }
  return { records: [...unique.values()], excluded };
}
export function prepareCampaign(
  store,
  input,
  actor,
  {
    draft = false,
    publicConfirmation = false,
    baseUrl = "http://127.0.0.1:3000",
  } = {},
) {
  const data = templateData({ ...input, name: "Message" });
  if (
    input.template_id &&
    !store.one("SELECT id FROM templates WHERE id=?", input.template_id)
  )
    fail("Template not found.");
  const resolved = draft
    ? { records: [], excluded: [] }
    : resolveRecipients(store, input.selection, data.kind);
  if (!draft && !resolved.records.length)
    fail("No eligible recipients. Check addresses and promotional consent.");
  const campaignId = id(),
    confirmationToken = id();
  store.tx(() => {
    store.run(
      "INSERT INTO campaigns(id,subject,html,text,template_id,kind,status,actor_id,confirmation_token,selection,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      campaignId,
      data.subject,
      data.html,
      data.text,
      input.template_id || null,
      data.kind,
      "Draft",
      actor?.id || null,
      confirmationToken,
      JSON.stringify(input.selection || {}),
      now(),
    );
    for (const record of resolved.records) {
      const vars = templateVars(store, record),
        token = data.kind === "promotional" ? id() : null;
      let personalizedHtml = personalize(data.html, vars, true),
        personalizedText = personalize(data.text, vars);
      if (input.ensure_student_number && record.student_number) {
        if (!personalizedHtml.includes(escapeHtml(record.student_number)))
          personalizedHtml +=
            "<p>Your student number: <strong>" +
            escapeHtml(record.student_number) +
            "</strong></p>";
        if (!personalizedText.includes(record.student_number))
          personalizedText +=
            "\n\nYour student number: " + record.student_number;
      }
      const unsubscribeUrl = token
        ? baseUrl + "/unsubscribe?token=" + token
        : "";
      store.run(
        "INSERT INTO email_recipients(id,campaign_id,application_id,student_id,email,full_name,subject,html,text,unsubscribe_token) VALUES(?,?,?,?,?,?,?,?,?,?)",
        id(),
        campaignId,
        record.source === "applications" ? record.id : null,
        record.source === "students" ? record.id : record.student_id || null,
        record.email,
        record.full_name,
        personalize(data.subject, vars),
        emailFrame(store, personalizedHtml, unsubscribeUrl),
        personalizedText +
          (unsubscribeUrl ? "\n\nUnsubscribe: " + unsubscribeUrl : ""),
        token,
      );
    }
    store.audit(
      actor,
      draft ? "Saved email draft" : "Prepared frozen email recipients",
      "campaign",
      campaignId,
      { count: resolved.records.length, kind: data.kind },
    );
  });
  return {
    id: campaignId,
    confirmationToken,
    count: resolved.records.length,
    excluded: resolved.excluded,
    recipients: resolved.records.map((r) => ({
      name: r.full_name,
      email: r.email,
      studentNumber: r.student_number || "",
      contactRecipient: r.contact_recipient || "student",
      guardianName: r.guardian_name || "",
    })),
  };
}
export function queueCampaign(
  store,
  campaignId,
  input,
  actor,
  { allowSend = false } = {},
) {
  if (!allowSend)
    fail(
      "Live email sending is disabled. Set ALLOW_EMAIL_SEND=true on the server when you are ready to send.",
      409,
    );
  if (!smtpPublic(store).configured)
    fail("Configure SMTP before sending.", 409);
  return store.tx(() => {
    const campaign = store.one(
      "SELECT * FROM campaigns WHERE id=?",
      campaignId,
    );
    if (!campaign) fail("Message not found.", 404);
    if (actor.role !== "Administrator" && campaign.actor_id !== actor.id)
      fail(
        "Only the initiating staff member or an administrator can confirm this send.",
        403,
      );
    if (
      campaign.confirmation_token !== input.confirmationToken ||
      input.confirmed !== true
    )
      fail("Confirm this exact recipient list.", 409);
    const count = store.one(
      "SELECT COUNT(*) n FROM email_recipients WHERE campaign_id=?",
      campaignId,
    ).n;
    if (!count) fail("Prepare the recipient list before sending.");
    if (campaign.confirmed_at)
      return { id: campaignId, status: campaign.status, count };
    if (campaign.status !== "Draft")
      fail(
        "Prepare a new draft to retry this message. Verify uncertain outcomes with your SMTP provider first.",
        409,
      );
    store.run(
      "UPDATE email_recipients SET status='Queued',next_attempt_at=? WHERE campaign_id=? AND status='Draft'",
      now(),
      campaignId,
    );
    store.run(
      "UPDATE campaigns SET status='Queued',confirmed_at=? WHERE id=?",
      now(),
      campaignId,
    );
    store.audit(actor, "Confirmed email send", "campaign", campaignId, {
      count,
    });
    return { id: campaignId, status: "Queued", count };
  });
}
export function registrationEmail(store, applicationId, options) {
  const record = store.one(
      "SELECT * FROM applications WHERE id=?",
      applicationId,
    ),
    template = store.one(
      "SELECT * FROM templates WHERE id=? AND archived_at IS NULL",
      "registration-received",
    );
  if (!template) return;
  const prepared = prepareCampaign(
    store,
    {
      ...template,
      template_id: template.id,
      selection: {
        mode: "selected",
        source: "applications",
        ids: [applicationId],
      },
    },
    null,
    { baseUrl: options.baseUrl },
  );
  const configured = smtpPublic(store).configured;
  if (options.allowSend && configured) {
    store.run(
      "UPDATE campaigns SET status='Queued',confirmed_at=? WHERE id=?",
      now(),
      prepared.id,
    );
    store.run(
      "UPDATE email_recipients SET status='Queued',next_attempt_at=? WHERE campaign_id=?",
      now(),
      prepared.id,
    );
  } else {
    store.run("UPDATE campaigns SET status='Failed' WHERE id=?", prepared.id);
    store.run(
      "UPDATE email_recipients SET status='Failed',error=? WHERE campaign_id=?",
      configured
        ? "Confirmation email was not sent because live sending is disabled."
        : "Confirmation email was not sent because SMTP is not configured.",
      prepared.id,
    );
    store.audit(
      null,
      "Confirmation email not sent",
      "application",
      applicationId,
    );
  }
}
export function startWorker(store, options = {}) {
  let busy = false,
    stopped = false;
  const tick = async () => {
    if (busy || stopped || !options.allowSend) return;
    const recipient = store.one(
      "SELECT r.*,c.actor_id,c.kind FROM email_recipients r JOIN campaigns c ON c.id=r.campaign_id WHERE r.status='Queued' AND r.next_attempt_at<=? ORDER BY r.next_attempt_at LIMIT 1",
      now(),
    );
    if (!recipient) return;
    busy = true;
    try {
      if (
        recipient.kind === "promotional" &&
        (store.one(
          "SELECT id FROM applications WHERE email=? AND unsubscribed=1",
          recipient.email,
        ) ||
          store.one(
            "SELECT id FROM students WHERE email=? AND unsubscribed=1",
            recipient.email,
          ))
      ) {
        store.run(
          "UPDATE email_recipients SET status='Failed',error='Recipient unsubscribed after this send was prepared.' WHERE id=?",
          recipient.id,
        );
        return;
      }
      const attemptId = id();
      store.tx(() => {
        store.run(
          "UPDATE email_recipients SET status='Sending',attempt_count=attempt_count+1,error=NULL WHERE id=?",
          recipient.id,
        );
        store.run(
          "UPDATE campaigns SET status='Sending' WHERE id=?",
          recipient.campaign_id,
        );
        store.run(
          "INSERT INTO email_attempts(id,recipient_id,started_at,status) VALUES(?,?,?,?)",
          attemptId,
          recipient.id,
          now(),
          "Sending",
        );
      });
      let smtp;
      try {
        smtp = transport(store, options);
        const config = store.setting("smtp");
        const result = await smtp.sendMail({
          from: { name: config.senderName, address: config.senderEmail },
          replyTo: config.replyTo || undefined,
          to: recipient.email,
          subject: recipient.subject,
          html: recipient.html,
          text: recipient.text,
          messageId: "<" + recipient.id + "@tomoni.registration>",
          headers: recipient.unsubscribe_token
            ? {
                "List-Unsubscribe":
                  "<" +
                  options.baseUrl +
                  "/unsubscribe?token=" +
                  recipient.unsubscribe_token +
                  ">",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              }
            : undefined,
        });
        if (!result.accepted?.length) {
          const error = new Error();
          error.code = "EENVELOPE";
          throw error;
        }
        store.run(
          "UPDATE email_recipients SET status='Accepted by SMTP server',accepted_at=?,error=NULL WHERE id=?",
          now(),
          recipient.id,
        );
        store.run(
          "UPDATE email_attempts SET status='Accepted by SMTP server',finished_at=? WHERE id=?",
          now(),
          attemptId,
        );
        store.audit(null, "SMTP accepted message", "email", recipient.id, {
          campaign: recipient.campaign_id,
        });
      } catch (error) {
        const attempt = recipient.attempt_count + 1;
        const safeTemporary =
          (error.responseCode >= 400 && error.responseCode < 500) ||
          (["ECONNECTION", "EDNS", "ETIMEDOUT"].includes(error.code) &&
            [
              "CONN",
              "EHLO",
              "HELO",
              "STARTTLS",
              "AUTH",
              "MAIL FROM",
              "RCPT TO",
              "MAIL",
              "RCPT",
            ].includes(error.command));
        const retry = safeTemporary && attempt < 3;
        const message =
          safeMailError(error) +
          (retry
            ? " A bounded retry is queued."
            : safeTemporary
              ? " Retry limit reached."
              : " No automatic retry; the delivery outcome may be uncertain.");
        store.run(
          "UPDATE email_recipients SET status=?,next_attempt_at=?,error=? WHERE id=?",
          retry ? "Queued" : "Failed",
          retry
            ? new Date(
                Date.now() + Math.min(900000, 30000 * 2 ** (attempt - 1)),
              ).toISOString()
            : null,
          message,
          recipient.id,
        );
        store.run(
          "UPDATE email_attempts SET status='Failed',finished_at=?,error=? WHERE id=?",
          now(),
          message,
          attemptId,
        );
        store.audit(null, "Email attempt failed", "email", recipient.id, {
          campaign: recipient.campaign_id,
          retry,
        });
      } finally {
        smtp?.close?.();
      }
      const statuses = store
        .all(
          "SELECT status FROM email_recipients WHERE campaign_id=?",
          recipient.campaign_id,
        )
        .map((r) => r.status);
      const status = statuses.includes("Queued")
        ? "Queued"
        : statuses.includes("Sending")
          ? "Sending"
          : statuses.includes("Failed")
            ? "Failed"
            : "Accepted by SMTP server";
      store.run(
        "UPDATE campaigns SET status=? WHERE id=?",
        status,
        recipient.campaign_id,
      );
    } finally {
      busy = false;
    }
  };
  const timer = setInterval(
    () => tick().catch(() => {}),
    options.interval || 3000,
  );
  timer.unref();
  return {
    tick,
    stop() {
      stopped = true;
      clearInterval(timer);
    },
  };
}

// Invoked only after the student and enrollment transaction has committed.
export function enrollmentEmail(store, applicationId, actor, options = {}) {
  const previous = store.one(
    "SELECT * FROM enrollment_notifications WHERE application_id=?",
    applicationId,
  );
  if (previous) return previous;
  const application = store.one(
    applicationSelect + " WHERE a.id=?",
    applicationId,
  );
  if (
    !application?.student_id ||
    !application.student_number ||
    !["Accepted", "Enrolled"].includes(application.status)
  )
    fail("Confirm enrollment before preparing its email.");
  const template = store.one(
    "SELECT * FROM templates WHERE id=? AND archived_at IS NULL",
    application.status === "Accepted"
      ? "application-accepted"
      : "enrollment-confirmed",
  );
  if (!template) fail("The enrollment confirmation template is unavailable.");
  const message = { ...template, kind: "operational" };
  if (!/{{\s*(student_number|student_id)\s*}}/.test(message.html))
    message.html +=
      "<p>Your student number: <strong>{{student_number}}</strong></p>";
  if (!/{{\s*(student_number|student_id)\s*}}/.test(message.text))
    message.text += "\n\nYour student number: {{student_number}}";
  const prepared = prepareCampaign(
    store,
    {
      ...message,
      ensure_student_number: true,
      template_id: template.id,
      selection: {
        mode: "selected",
        source: "applications",
        ids: [applicationId],
      },
    },
    actor,
    { baseUrl: options.baseUrl },
  );
  const error = !smtpPublic(store).configured
    ? "SMTP is not configured."
    : !options.allowSend
      ? "Live email sending is disabled."
      : null;
  store.run(
    "UPDATE campaigns SET status=?,confirmed_at=? WHERE id=?",
    error ? "Failed" : "Queued",
    error ? null : now(),
    prepared.id,
  );
  store.run(
    "UPDATE email_recipients SET status=?,next_attempt_at=?,error=? WHERE campaign_id=?",
    error ? "Failed" : "Queued",
    error ? null : now(),
    error,
    prepared.id,
  );
  store.run(
    "INSERT INTO enrollment_notifications(application_id,campaign_id,actor_id,error,created_at) VALUES(?,?,?,?,?)",
    applicationId,
    prepared.id,
    actor.id,
    error,
    now(),
  );
  store.audit(
    actor,
    error
      ? "Enrollment email not sent"
      : "Queued enrollment confirmation email",
    "application",
    applicationId,
    { campaign: prepared.id, studentNumber: application.student_number },
  );
  return { campaign_id: prepared.id, error };
}
export function retryEnrollmentEmail(
  store,
  applicationId,
  actor,
  options,
  input,
) {
  if (input.confirmed !== true)
    fail("Confirm the actual recipient before retrying.", 409);
  if (!options.allowSend || !smtpPublic(store).configured)
    fail("Configure SMTP and enable sending before retrying.", 409);
  return store.tx(() => {
    const notification = store.one(
      "SELECT * FROM enrollment_notifications WHERE application_id=?",
      applicationId,
    );
    if (!notification) fail("Enrollment email not found.", 404);
    if (!notification.campaign_id) {
      store.run(
        "DELETE FROM enrollment_notifications WHERE application_id=?",
        applicationId,
      );
      return enrollmentEmail(store, applicationId, actor, options);
    }
    const recipients = store.all(
      "SELECT * FROM email_recipients WHERE campaign_id=?",
      notification.campaign_id,
    );
    if (recipients.some((r) => r.status !== "Failed"))
      return {
        campaign_id: notification.campaign_id,
        status: "Already queued or accepted",
      };
    if (
      recipients.some((r) => r.attempt_count > 0) &&
      input.uncertain_acknowledged !== true
    )
      fail(
        "Check the SMTP delivery outcome and acknowledge possible duplicate delivery before retrying.",
        409,
      );
    store.run(
      "UPDATE email_recipients SET status='Queued',next_attempt_at=?,error=NULL,attempt_count=0 WHERE campaign_id=? AND status='Failed'",
      now(),
      notification.campaign_id,
    );
    store.run(
      "UPDATE campaigns SET status='Queued',confirmed_at=? WHERE id=?",
      now(),
      notification.campaign_id,
    );
    store.run(
      "UPDATE enrollment_notifications SET error=NULL WHERE application_id=?",
      applicationId,
    );
    store.audit(
      actor,
      "Authorized enrollment email retry",
      "application",
      applicationId,
      { campaign: notification.campaign_id },
    );
    return { campaign_id: notification.campaign_id, status: "Queued" };
  });
}
