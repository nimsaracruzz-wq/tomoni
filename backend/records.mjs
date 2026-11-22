import { assertSingleRegistration } from "./registration-identity.mjs";
import {
  confirmEnrollment,
  reviseEnrollment,
  recordEnrollmentHistory,
} from "./enrollment.mjs";
import { categoryName, contactEmail, contactPhone } from "./categories.mjs";
import { id, now, hash, STATUSES } from "./db.mjs";
import { applicationData, fail, text, csvCell } from "./validation.mjs";
export function createApplication(store, input, actor = null, key = null) {
  const data = applicationData(store, input, { manual: !!actor });
  const fingerprint = hash(JSON.stringify(data));
  return store.tx(() => {
    if (key) {
      const prior = store.one("SELECT * FROM submission_keys WHERE key=?", key);
      if (prior) {
        if (prior.fingerprint !== fingerprint)
          fail(
            "This form has already been submitted. Open a new form to apply again.",
            409,
          );
        return store.one(
          "SELECT id,reference FROM applications WHERE id=?",
          prior.application_id,
        );
      }
    }
    assertSingleRegistration(store, data);
    const applicationId = id(),
      reference =
        "TOM-" +
        new Date().getUTCFullYear() +
        "-" +
        applicationId.replace(/-/g, "").slice(0, 12).toUpperCase(),
      stamp = now();
    const duplicate = store.one(
      "SELECT id FROM applications WHERE email=? ORDER BY created_at DESC LIMIT 1",
      data.email,
    );
    const columns = [
      "full_name",
      "preferred_name",
      "email",
      "phone",
      "country",
      "home_address",
      "address_line1",
      "address_line2",
      "address_city",
      "course_id",
      "intake_id",
      "schedule_id",
      "current_level",
      "category",
      "registration_category",
      "guardian_name",
      "guardian_email",
      "guardian_phone",
      "contact_recipient",
      "existing_student_id",
      "message",
      "privacy_acknowledged",
      "promotional_consent",
    ];
    store.run(
      "INSERT INTO applications(id,reference," +
        columns.join(",") +
        ",duplicate_of,created_at,updated_at) VALUES(" +
        Array(columns.length + 5)
          .fill("?")
          .join(",") +
        ")",
      applicationId,
      reference,
      ...columns.map((k) => data[k]),
      duplicate?.id || null,
      stamp,
      stamp,
    );
    store.run(
      "INSERT INTO status_history(id,application_id,to_status,actor_id,created_at) VALUES(?,?,?,?,?)",
      id(),
      applicationId,
      "New",
      actor?.id || null,
      stamp,
    );
    if (key)
      store.run(
        "INSERT INTO submission_keys VALUES(?,?,?,?)",
        key,
        fingerprint,
        applicationId,
        stamp,
      );
    store.audit(actor, "Created registration", "application", applicationId, {
      reference,
      potentialDuplicate: !!duplicate,
    });
    return { id: applicationId, reference, created: true };
  });
}
function dateBoundary(value, timezone, nextDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail("Invalid date filter.");
  let target = Date.parse(value + "T00:00:00Z");
  if (
    !Number.isFinite(target) ||
    new Date(target).toISOString().slice(0, 10) !== value
  )
    fail("Invalid date filter.");
  if (nextDay) target += 86400000;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  let guess = target;
  for (let n = 0; n < 4; n++) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(guess))
        .filter((p) => p.type !== "literal")
        .map((p) => [p.type, Number(p.value)]),
    );
    const local = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const adjusted = target - (local - guess);
    if (adjusted === guess) break;
    guess = adjusted;
  }
  return new Date(guess).toISOString();
}

export function filters(params, students = false, timezone = "Asia/Tokyo") {
  let clauses = [],
    args = [];
  const add = (sql, value) => {
    clauses.push(sql);
    args.push(value);
  };
  if (students) {
    if (params.get("search")) {
      const q = "%" + params.get("search").slice(0, 120) + "%";
      clauses.push(
        "(s.full_name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.student_number LIKE ?)",
      );
      args.push(q, q, q, q);
    }
    for (const [key, column] of [
      ["category", "category"],
      ["year", "enrollment_year"],
      ["intake", "intake_id"],
      ["status", "status"],
      ["course", "course_id"],
    ])
      if (params.get(key)) {
        clauses.push(
          "EXISTS(SELECT 1 FROM enrollments ef WHERE ef.student_id=s.id AND ef.id=(SELECT id FROM enrollments latest WHERE latest.student_id=s.id ORDER BY confirmed_at DESC,rowid DESC LIMIT 1) AND ef." +
            column +
            "=?)",
        );
        args.push(params.get(key));
      }
    return {
      where: clauses.length ? " WHERE " + clauses.join(" AND ") : "",
      args,
    };
  }
  add(
    "a.archived_at IS " +
      (params.get("archived") === "true" ? "NOT " : "") +
      "NULL",
    undefined,
  );
  args.pop();
  if (params.get("search")) {
    const q = "%" + params.get("search").slice(0, 120) + "%";
    clauses.push(
      "(a.full_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ? OR a.reference LIKE ? OR a.reserved_student_number LIKE ? OR EXISTS(SELECT 1 FROM students sn WHERE sn.id=a.student_id AND sn.student_number LIKE ?) OR a.guardian_email LIKE ?)",
    );
    args.push(q, q, q, q, q, q, q);
  }
  for (const [key, column] of [
    ["course", "course_id"],
    ["category", "registration_category"],
    ["year", "enrollment_year"],
    ["intake", "intake_id"],
    ["status", "status"],
    ["assigned", "assigned_to"],
  ])
    if (params.get(key)) {
      if (key === "status" && params.get(key) === "awaiting")
        clauses.push("a.status IN ('New','Reviewing')");
      else if (key === "assigned" && params.get(key) === "unassigned")
        clauses.push("a.assigned_to IS NULL");
      else add("a." + column + "=?", params.get(key));
    }
  if (
    params.get("from") &&
    params.get("to") &&
    params.get("from") > params.get("to")
  )
    fail("The start date must be before the end date.");
  for (const key of ["from", "to"])
    if (params.get(key))
      add(
        "a.created_at" + (key === "to" ? "<" : ">=") + "?",
        dateBoundary(params.get(key), timezone, key === "to"),
      );
  return { where: " WHERE " + clauses.join(" AND "), args };
}
export const applicationSelect =
  "SELECT a.*,a.registration_category AS category,c.name AS course_name,i.name AS intake_name,q.name AS schedule_name,u.name AS assigned_name,COALESCE(s.student_number,a.reserved_student_number) AS student_number FROM applications a LEFT JOIN courses c ON c.id=a.course_id LEFT JOIN intakes i ON i.id=a.intake_id LEFT JOIN schedules q ON q.id=a.schedule_id LEFT JOIN users u ON u.id=a.assigned_to LEFT JOIN students s ON s.id=a.student_id";
export function listRecords(store, params, students = false, all = false) {
  const { where, args } = filters(
    params,
    students,
    store.setting("institute").timezone,
  );
  const page = Math.max(1, Math.min(100000, Number(params.get("page")) || 1)),
    limit = all
      ? 10000
      : Math.max(10, Math.min(100, Number(params.get("limit")) || 20));
  const order = students
    ? { name: "s.full_name", created: "s.created_at" }
    : {
        name: "a.full_name",
        created: "a.created_at",
        status: "a.status",
        course: "a.course_id",
        intake: "a.intake_id",
      };
  const sort = order[params.get("sort")] || order.created,
    direction = params.get("direction") === "asc" ? "ASC" : "DESC";
  const rows = store.all(
    (students ? studentSelect : applicationSelect) +
      where +
      " ORDER BY " +
      sort +
      " " +
      direction +
      ", " +
      (students ? "s" : "a") +
      ".id LIMIT ? OFFSET ?",
    ...args,
    limit,
    all ? 0 : (page - 1) * limit,
  );
  const total = store.one(
    "SELECT COUNT(*) AS count FROM " +
      (students ? "students s" : "applications a") +
      where,
    ...args,
  ).count;
  return { rows, total, page, limit };
}
export function profile(store, applicationId) {
  const row = store.one(applicationSelect + " WHERE a.id=?", applicationId);
  if (!row) fail("Registration not found.", 404);
  return {
    ...row,
    registration_category_name: categoryName(row.category),
    enrollment:
      store.one(
        "SELECT * FROM enrollments WHERE application_id=?",
        applicationId,
      ) || null,
    recipient_email: contactEmail(row),
    enrollment_notification:
      store.one(
        "SELECT n.*,c.status AS email_status,r.error AS email_error,r.email AS recipient_email FROM enrollment_notifications n LEFT JOIN campaigns c ON c.id=n.campaign_id LEFT JOIN email_recipients r ON r.campaign_id=c.id WHERE n.application_id=?",
        applicationId,
      ) || null,
    enrollment_history: store.all(
      "SELECT h.*,u.name AS actor_name FROM enrollment_history h JOIN enrollments e ON e.id=h.enrollment_id LEFT JOIN users u ON u.id=h.actor_id WHERE e.application_id=? ORDER BY h.created_at DESC",
      applicationId,
    ),
    approval_notification:
      store.one(
        "SELECT n.*,c.status AS email_status,r.error AS email_error FROM approval_notifications n LEFT JOIN campaigns c ON c.id=n.campaign_id LEFT JOIN email_recipients r ON r.campaign_id=c.id WHERE n.application_id=?",
        applicationId,
      ) || null,
    notes: store.all(
      "SELECT n.*,u.name AS actor_name FROM notes n LEFT JOIN users u ON u.id=n.actor_id WHERE n.application_id=? ORDER BY n.created_at DESC",
      applicationId,
    ),
    tags: store
      .all(
        "SELECT t.name FROM tags t JOIN application_tags x ON x.tag_id=t.id WHERE x.application_id=?",
        applicationId,
      )
      .map((t) => t.name),
    history: store.all(
      "SELECT h.*,u.name AS actor_name FROM status_history h LEFT JOIN users u ON u.id=h.actor_id WHERE h.application_id=? ORDER BY h.created_at DESC",
      applicationId,
    ),
    emails: store.all(
      "SELECT r.id,r.email,r.subject,r.status,r.attempt_count,r.error,r.accepted_at,c.created_at,c.kind,u.name AS actor_name FROM email_recipients r JOIN campaigns c ON c.id=r.campaign_id LEFT JOIN users u ON u.id=c.actor_id WHERE r.application_id=? ORDER BY c.created_at DESC",
      applicationId,
    ),
    activity: store.all(
      "SELECT * FROM audit_events WHERE record_id=? ORDER BY id DESC LIMIT 100",
      applicationId,
    ),
  };
}
export function updateApplication(store, applicationId, input, actor) {
  return store.tx(() => {
    const old = store.one(
      "SELECT * FROM applications WHERE id=?",
      applicationId,
    );
    if (!old) fail("Registration not found.", 404);
    let changes = {};
    if (input.details) {
      const d = applicationData(store, input.details, {
        manual: true,
        editing: true,
      });
      assertSingleRegistration(store, d, old);
      for (const [key, value] of Object.entries(d))
        if (!["privacy_acknowledged", "promotional_consent"].includes(key))
          changes[key] = value;
    }
    if (input.status !== undefined) {
      if (!STATUSES.includes(input.status)) fail("Invalid application status.");
      if (
        (old.student_id && !["Accepted", "Enrolled"].includes(input.status)) ||
        (old.status === "Enrolled" && input.status !== "Enrolled")
      )
        fail(
          "An enrolled application keeps its enrollment history. Edit its current class or archive it.",
        );
      changes.status = input.status;
    }
    if (input.assigned_to !== undefined) {
      if (
        input.assigned_to &&
        !store.one(
          "SELECT id FROM users WHERE id=? AND active=1",
          input.assigned_to,
        )
      )
        fail("Choose an active staff member.");
      changes.assigned_to = input.assigned_to || null;
    }
    if (input.archived !== undefined)
      changes.archived_at = input.archived ? now() : null;
    if (
      input.student_number !== undefined ||
      input.reserved_student_number !== undefined ||
      input.details?.student_number !== undefined
    )
      fail("Assigned student numbers cannot be edited.");
    if (["Accepted", "Enrolled"].includes(changes.status)) {
      if (!old.student_id && input.enrollment_confirmed !== true)
        fail(
          "Review and confirm enrollment before assigning a student number.",
          409,
        );
      const application = { ...old, ...changes };
      const enrollment = confirmEnrollment(store, application, actor);
      Object.assign(changes, enrollment);
    }
    const stamp = now();
    if (Object.keys(changes).length) {
      store.run(
        "UPDATE applications SET " +
          Object.keys(changes)
            .map((k) => k + "=?")
            .join(",") +
          ",updated_at=? WHERE id=?",
        ...Object.values(changes),
        stamp,
        applicationId,
      );
      if (changes.status && changes.status !== old.status)
        store.run(
          "INSERT INTO status_history(id,application_id,from_status,to_status,actor_id,created_at) VALUES(?,?,?,?,?,?)",
          id(),
          applicationId,
          old.status,
          changes.status,
          actor.id,
          stamp,
        );
      store.audit(
        actor,
        input.archived !== undefined
          ? input.archived
            ? "Archived registration"
            : "Restored registration"
          : changes.status !== undefined
            ? "Changed registration status"
            : "Edited registration",
        "application",
        applicationId,
        { fields: Object.keys(changes), status: changes.status || old.status },
      );
    }
    if (input.details && old.student_id) {
      const application = store.one(
        "SELECT * FROM applications WHERE id=?",
        applicationId,
      );
      reviseEnrollment(store, application, actor);
      store.run(
        "UPDATE students SET full_name=?,preferred_name=?,email=?,phone=?,country=?,guardian_name=?,guardian_email=?,guardian_phone=?,contact_recipient=?,home_address=?,address_line1=?,address_line2=?,address_city=? WHERE id=?",
        application.full_name,
        application.preferred_name,
        application.email,
        application.phone,
        application.country,
        application.guardian_name,
        application.guardian_email,
        application.guardian_phone,
        application.contact_recipient,
        application.home_address,
        application.address_line1,
        application.address_line2,
        application.address_city,
        application.student_id,
      );
    }
    if (input.enrollment_status !== undefined) {
      if (
        !["Enrolled", "Completed", "Withdrawn"].includes(
          input.enrollment_status,
        )
      )
        fail("Choose a valid enrollment status.");
      const enrollment = store.one(
        "SELECT * FROM enrollments WHERE application_id=?",
        applicationId,
      );
      if (!enrollment) fail("Confirm enrollment before changing its status.");
      if (enrollment.status !== input.enrollment_status) {
        store.run(
          "UPDATE enrollments SET status=?,updated_at=? WHERE id=?",
          input.enrollment_status,
          now(),
          enrollment.id,
        );
        recordEnrollmentHistory(store, enrollment.id, actor);
        store.audit(
          actor,
          "Changed enrollment status",
          "student",
          enrollment.student_id,
          { enrollmentId: enrollment.id, status: input.enrollment_status },
        );
      }
    }
    if (input.note) {
      const body = text(input.note, 4000);
      if (body) {
        store.run(
          "INSERT INTO notes(id,application_id,actor_id,body,created_at) VALUES(?,?,?,?,?)",
          id(),
          applicationId,
          actor.id,
          body,
          stamp,
        );
        store.audit(actor, "Added internal note", "application", applicationId);
      }
    }
    if (input.tags !== undefined) {
      if (!Array.isArray(input.tags) || input.tags.length > 15)
        fail("Use at most 15 tags.");
      store.run(
        "DELETE FROM application_tags WHERE application_id=?",
        applicationId,
      );
      for (const tag of new Set(
        input.tags.map((t) => text(t, 40)).filter(Boolean),
      )) {
        const tagId =
          store.one("SELECT id FROM tags WHERE name=?", tag)?.id || id();
        store.run("INSERT OR IGNORE INTO tags VALUES(?,?)", tagId, tag);
        store.run(
          "INSERT OR IGNORE INTO application_tags VALUES(?,?)",
          applicationId,
          tagId,
        );
      }
      store.audit(actor, "Updated tags", "application", applicationId);
    }
    return {
      id: applicationId,
      ...store.one(
        "SELECT student_id,enrollment_year FROM applications WHERE id=?",
        applicationId,
      ),
    };
  });
}
export function overview(store) {
  return {
    metrics: {
      new: store.one(
        "SELECT COUNT(*) n FROM applications WHERE status='New' AND archived_at IS NULL",
      ).n,
      reviewing: store.one(
        "SELECT COUNT(*) n FROM applications WHERE status IN ('New','Reviewing') AND archived_at IS NULL",
      ).n,
      accepted: store.one(
        "SELECT COUNT(*) n FROM applications WHERE status='Accepted' AND archived_at IS NULL",
      ).n,
      students: store.one("SELECT COUNT(*) n FROM students").n,
      failed: store.one(
        "SELECT (SELECT COUNT(*) FROM email_recipients WHERE status='Failed')+(SELECT COUNT(*) FROM approval_notifications WHERE campaign_id IS NULL AND error IS NOT NULL)+(SELECT COUNT(*) FROM enrollment_notifications WHERE campaign_id IS NULL AND error IS NOT NULL) n",
      ).n,
    },
    recent: store.all(
      applicationSelect +
        " WHERE a.archived_at IS NULL ORDER BY a.created_at DESC LIMIT 6",
    ),
    activity: store.all("SELECT * FROM audit_events ORDER BY id DESC LIMIT 8"),
  };
}
export function exportCsv(store, params, students = false) {
  const result = listRecords(store, params, students, true);
  if (result.total > 10000)
    fail("Narrow the filters to export at most 10,000 records.");
  const keys = [
    "reference",
    "student_number",
    "full_name",
    "registration_category",
    "course_name",
    "intake_name",
    "enrollment_year",
    "status",
    "email",
    "phone",
    "home_address",
    "address_line1",
    "address_line2",
    "address_city",
    "guardian_name",
    "guardian_email",
    "guardian_phone",
    "contact_recipient",
    "recipient_email",
    "created_at",
  ];
  result.rows = result.rows.map((r) => ({
    ...r,
    registration_category: categoryName(r.registration_category || r.category),
    intake_name:
      (r.registration_category || r.category) === "visa"
        ? r.intake_name || "Not recorded"
        : "Not applicable",
    recipient_email: contactEmail(r),
  }));
  return (
    keys.map(csvCell).join(",") +
    "\r\n" +
    result.rows
      .map((r) => keys.map((k) => csvCell(r[k])).join(","))
      .join("\r\n")
  );
}

export const studentSelect =
  "SELECT s.*,a.reference,e.category AS registration_category,e.category,e.course_id,c.name AS course_name,e.intake_id,i.name AS intake_name,e.enrollment_year,e.status FROM students s LEFT JOIN enrollments e ON e.id=(SELECT id FROM enrollments latest WHERE latest.student_id=s.id ORDER BY confirmed_at DESC,rowid DESC LIMIT 1) LEFT JOIN applications a ON a.id=e.application_id LEFT JOIN courses c ON c.id=e.course_id LEFT JOIN intakes i ON i.id=e.intake_id";
