import { CATEGORIES } from "./categories.mjs";
import sanitizeHtml from "sanitize-html";
export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export const fail = (message, status = 400, fields) => {
  throw new HttpError(status, message, fields);
};
export function text(value, max = 2000) {
  if (typeof value !== "string" || value.length > max)
    fail("Invalid text value.");
  return value.trim();
}
export const emailValid = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
  !/[\r\n]/.test(value);
export function localPhone(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const normalized = trimmed.replace(/^\+94\s*/, "0").replace(/[ -]/g, "");
  if (/^0[1-9]\d{8}$/.test(normalized)) return normalized;
  if (/^\+?[1-9]\d{7,14}$/.test(normalized)) return normalized;
  return null;
}
export function applicationData(
  store,
  input,
  { manual = false, editing = false } = {},
) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail("Please complete the registration form.");
  const fields = {},
    data = {};
  const labels = {
    full_name: "Full name",
    preferred_name: "Preferred name",
    email: "Email",
    phone: "Phone number",
    address_line1: "Address Line 1",
    address_line2: "Address Line 2",
    address_city: "City / Town",
    course_id: "Preferred course",
    intake_id: "Preferred intake",
    current_level: "Current Japanese level",
    category: "Registration category",
    guardian_name: "Guardian name",
    guardian_email: "Guardian email",
    guardian_phone: "Guardian phone",
    contact_recipient: "Preferred contact recipient",
    message: "Message",
  };
  for (const key of Object.keys(labels)) {
    const max = key.startsWith("address_")
      ? 500
      : key === "message"
        ? 2000
        : ["email", "guardian_email"].includes(key)
          ? 254
          : 120;
    if (input[key] !== undefined && typeof input[key] !== "string")
      fields[key] = "Enter a valid " + labels[key].toLowerCase() + ".";
    data[key] = typeof input[key] === "string" ? input[key].trim() : "";
    if (key !== "message" && /[\u0000-\u001f]/.test(data[key]))
      fields[key] = "Use a single line without control characters.";
    if (data[key].length > max)
      fields[key] = "Use at most " + max + " characters.";
  }
  for (const key of [
    "full_name",
    "email",
    "phone",
    "address_line1",
    "address_city",
    "course_id",
    "current_level",
    "category",
  ])
    if (!data[key]) fields[key] = labels[key] + " is required.";
  const kids = data.category === "kids";
  if (kids && !data.email) delete fields.email;
  if (kids && !data.phone) delete fields.phone;
  if ((!kids || data.email) && !emailValid(data.email))
    fields.email = "Enter a valid student email address.";
  data.email = data.email.toLowerCase();
  data.home_address = [
    data.address_line1,
    data.address_line2,
    data.address_city,
  ]
    .filter(Boolean)
    .join(", ");
  if (!editing) data.schedule_id = null;
  data.country = "Sri Lanka";
  const phone = localPhone(data.phone);
  if ((!kids || data.phone) && !phone)
    fields.phone =
      "Enter a 10-digit Sri Lankan number starting with 0, for example 077 123 4567.";
  if (phone) data.phone = phone;
  for (const [key, table] of [["course_id", "courses"]])
    if (
      !store.one(
        "SELECT id FROM " +
          table +
          " WHERE id=?" +
          (editing ? "" : " AND active=1"),
        data[key],
      )
    )
      fields[key] = "Select an available option.";
  if (
    !["Beginner / No experience", "N5", "N4", "N3", "N2", "N1"].includes(
      data.current_level,
    )
  )
    fields.current_level = "Select your current level.";
  if (!CATEGORIES.some((c) => c.id === data.category))
    fields.category = "Select a registration category.";
  data.registration_category = data.category;
  if (data.category === "visa") {
    const intake = store.one(
      "SELECT id,year,month FROM intakes WHERE id=?" +
        (editing ? "" : " AND active=1"),
      data.intake_id,
    );
    if (!intake || !intake.year || !intake.month)
      fields.intake_id =
        "Select an available visa intake with a configured year and month.";
  } else data.intake_id = null;
  if (kids) {
    if (!["student", "guardian"].includes(data.contact_recipient))
      fields.contact_recipient = "Choose the student or guardian recipient.";
    if (data.contact_recipient === "guardian") {
      if (!data.guardian_name)
        fields.guardian_name = "Guardian name is required.";
      if (!emailValid(data.guardian_email))
        fields.guardian_email = "Enter a valid guardian email.";
      if (!localPhone(data.guardian_phone))
        fields.guardian_phone =
          "Enter a Sri Lankan guardian number, for example 077 123 4567.";
    } else {
      if (!emailValid(data.email))
        fields.email = "Enter the student contact email.";
      if (!localPhone(data.phone))
        fields.phone =
          "Enter a Sri Lankan student number, for example 077 123 4567.";
    }
    if (data.guardian_phone && !localPhone(data.guardian_phone))
      fields.guardian_phone = "Enter a valid Sri Lankan guardian phone number.";
    if (localPhone(data.guardian_phone))
      data.guardian_phone = localPhone(data.guardian_phone);
    if (data.guardian_email && !emailValid(data.guardian_email))
      fields.guardian_email = "Enter a valid guardian email.";
  } else {
    data.contact_recipient = "student";
    data.guardian_name = "";
    data.guardian_email = "";
    data.guardian_phone = "";
  }
  data.guardian_email = data.guardian_email.toLowerCase();
  data.existing_student_id = manual
    ? text(input.existing_student_id || "", 80) || null
    : null;
  if (
    data.existing_student_id &&
    !store.one("SELECT id FROM students WHERE id=?", data.existing_student_id)
  )
    fields.existing_student_id = "Choose an existing student.";
  if (!manual && input.privacy_acknowledged !== true)
    fields.privacy_acknowledged = "Please acknowledge the privacy notice.";
  data.privacy_acknowledged = input.privacy_acknowledged === true ? 1 : 0;
  data.promotional_consent = input.promotional_consent === true ? 1 : 0;
  if (Object.keys(fields).length)
    fail("Please correct the highlighted fields.", 400, fields);
  return data;
}
export const cleanHtml = (value) =>
  sanitizeHtml(text(value, 60000), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "table",
      "tbody",
      "tr",
      "td",
      "th",
      "span",
    ],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["https", "mailto"],
    disallowedTagsMode: "discard",
  });
export const VARIABLES = [
  "first_name",
  "full_name",
  "application_reference",
  "student_id",
  "student_number",
  "registration_category",
  "enrollment_year",
  "course_name",
  "intake",
  "institute_name",
];
export function templateData(input) {
  const data = {
    name: text(input.name || "", 120),
    subject: text(input.subject || "", 200),
    html: cleanHtml(input.html || ""),
    text: text(input.text || "", 30000),
    kind: input.kind,
  };
  if (!data.name || !data.subject || !data.text)
    fail("Name, subject, and plain text are required.");
  if (/[\r\n]/.test(data.subject)) fail("Subject must be one line.");
  if (!["operational", "promotional"].includes(data.kind))
    fail("Choose an email type.");
  for (const part of [data.subject, data.html, data.text])
    for (const match of part.matchAll(/{{\s*([^{}]+?)\s*}}/g))
      if (!VARIABLES.includes(match[1])) fail("Unknown variable: " + match[1]);
  return data;
}
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function personalize(value, vars, html = false) {
  if (!vars.intake) {
    if (html)
      value = value.replace(
        /<(p|div|li|tr)\b[^>]*>(?:(?!<\/\1>)[\s\S])*?{{\s*intake\s*}}(?:(?!<\/\1>)[\s\S])*?<\/\1>/gi,
        "",
      );
    else
      value = value
        .split("\n")
        .filter((line) => !/{{\s*intake\s*}}/.test(line))
        .join("\n");
  }
  return value.replace(/{{\s*([^{}]+?)\s*}}/g, (_, key) =>
    html
      ? escapeHtml(vars[key] ?? "Not yet assigned")
      : String(vars[key] ?? "Not yet assigned"),
  );
}
export const csvCell = (value) =>
  '"' +
  String(value ?? "")
    .replace(/^[\s]*[=+@-]/, (m) => "'" + m)
    .replace(/"/g, '""') +
  '"';
