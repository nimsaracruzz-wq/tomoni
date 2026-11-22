"use strict";
const $ = (s) => document.querySelector(s),
  h = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const state = {
  me: null,
  catalog: null,
  selected: new Set(),
  emailSelection: null,
};
let handlers = {},
  forms = {},
  routeVersion = 0,
  toastTimer;
const icon = (name) => '<i data-lucide="' + name + '"></i>';
const badge = (value) =>
  '<span class="badge ' +
  h(String(value).toLowerCase().replace(/\s+/g, "-")) +
  '">' +
  h(value) +
  "</span>";
const categoryLabel = (value) =>
  state.catalog?.categories?.find((c) => c.id === value)?.name ||
  value ||
  "Not recorded";
const intakeLabel = (r) =>
  (r.registration_category || r.category) === "visa"
    ? r.intake_name || r.intake_id || "Not recorded"
    : "Not applicable";
const recipientEmail = (r) =>
  (r.registration_category || r.category) === "kids" &&
  r.contact_recipient === "guardian"
    ? r.guardian_email
    : r.email;
const isAdmin = () => state.me?.role === "Administrator";
const can = (permission) =>
  isAdmin() || state.me?.permissions[permission] === true;
const datetime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: state.catalog?.institute.timezone || "Asia/Tokyo",
      }).format(new Date(value))
    : "—";
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeZone: state.catalog?.institute.timezone || "Asia/Tokyo",
      }).format(new Date(value))
    : "—";
function icons() {
  globalThis.lucide?.createIcons();
}
function toast(message, error = false) {
  clearTimeout(toastTimer);
  $("#toast").className = error ? "error" : "";
  $("#toast").textContent = message;
  toastTimer = setTimeout(() => ($("#toast").textContent = ""), 6000);
}
async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = state.me?.csrf;
    options.body = JSON.stringify(options.body);
  }
  const response = await fetch(path, { ...options, headers });
  if (response.status === 401) {
    location.href = "/admin/login";
    throw new Error("Please sign in.");
  }
  const data = await response.json();
  if (!response.ok) {
    const e = new Error(data.error || "Request failed.");
    e.fields = data.fields;
    throw e;
  }
  return data;
}
const run = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    toast(
      e instanceof TypeError
        ? "Unable to connect. Please try again."
        : e.message,
      true,
    );
  }
};
const go = (hash) => {
  if (location.hash === "#" + hash) render();
  else location.hash = hash;
};
const heading = (eyebrow, title, subtitle, actions = "") =>
  '<div class="page-heading"><div><div class="eyebrow">' +
  eyebrow +
  "</div><h1>" +
  h(title) +
  "</h1><p>" +
  h(subtitle) +
  '</p></div><div class="actions">' +
  actions +
  "</div></div>";
const button = (action, label, style = "", ic = "") =>
  '<button class="btn ' +
  style +
  '" data-action="' +
  action +
  '">' +
  (ic ? icon(ic) : "") +
  label +
  "</button>";
const empty = (title, message, ic = "inbox") =>
  '<div class="empty-state">' +
  icon(ic) +
  "<h3>" +
  h(title) +
  "</h3><p>" +
  h(message) +
  "</p></div>";
const panel = (title, body, action = "") =>
  '<section class="panel"><div class="panel-head"><h2>' +
  title +
  "</h2>" +
  action +
  "</div>" +
  body +
  "</section>";
const field = (key, label, value = "", type = "text", required = true) =>
  "<label>" +
  label +
  '<input type="' +
  type +
  '" name="' +
  key +
  '" value="' +
  h(value) +
  '" ' +
  (required ? "required" : "") +
  ' maxlength="' +
  (key === "email" ? 254 : 500) +
  '" aria-describedby="err-' +
  key +
  '"><span class="form-error" id="err-' +
  key +
  '"></span></label>';
const options = (rows, value = "", blank = "Choose an option") =>
  '<option value="">' +
  blank +
  "</option>" +
  rows
    .map(
      (row) =>
        '<option value="' +
        h(row.id ?? row) +
        '" ' +
        ((row.id ?? row) === value ? "selected" : "") +
        ">" +
        h(row.name ?? row) +
        "</option>",
    )
    .join("");
const select = (
  key,
  label,
  rows,
  value = "",
  required = true,
  blank = "Choose an option",
) =>
  "<label>" +
  label +
  '<select name="' +
  key +
  '" aria-describedby="err-' +
  key +
  '" ' +
  (required ? "required" : "") +
  ">" +
  options(rows, value, blank) +
  '</select><span class="form-error" id="err-' +
  key +
  '"></span></label>';
const textarea = (key, label, value = "", rows = 4, required = false) =>
  '<label class="full">' +
  label +
  '<textarea name="' +
  key +
  '" aria-describedby="err-' +
  key +
  '" rows="' +
  rows +
  '" maxlength="60000" ' +
  (required ? "required" : "") +
  ">" +
  h(value) +
  '</textarea><span class="form-error" id="err-' +
  key +
  '"></span></label>';
const check = (key, label, checked = false) =>
  '<label class="check-label"><input name="' +
  key +
  '" type="checkbox" ' +
  (checked ? "checked" : "") +
  "><span>" +
  label +
  "</span></label>";
function modal(title, body, footer = "") {
  const d = $("#modal");
  if (d.open) d.close();
  $("#modal-content").innerHTML =
    '<div class="modal-head"><h2>' +
    h(title) +
    '</h2><button class="icon-btn" data-action="close-modal" aria-label="Close dialog">' +
    icon("x") +
    '</button></div><div class="modal-body">' +
    body +
    "</div>" +
    footer;
  handlers["close-modal"] = () => d.close();
  d.showModal();
  icons();
}
function confirmAction(title, message, onConfirm) {
  modal(
    title,
    "<p>" +
      h(message) +
      '</p><p id="confirm-error" class="form-error" role="alert"></p>',
    '<div class="modal-actions">' +
      button("close-modal", "Cancel") +
      button("confirm-action", "Confirm", "primary") +
      "</div>",
  );
  handlers["confirm-action"] = async (_, button) => {
    button.disabled = true;
    try {
      await onConfirm();
      $("#modal").close();
    } catch (e) {
      $("#confirm-error").textContent = e.message;
      button.disabled = false;
    }
  };
}
function pager(result) {
  return (
    '<div class="pagination"><span>' +
    result.total +
    " record" +
    (result.total === 1 ? "" : "s") +
    " · Page " +
    result.page +
    " of " +
    Math.max(1, Math.ceil(result.total / result.limit)) +
    '</span><div class="actions"><button class="btn small" data-action="previous-page" ' +
    (result.page <= 1 ? "disabled" : "") +
    '>Previous</button><button class="btn small" data-action="next-page" ' +
    (result.page * result.limit >= result.total ? "disabled" : "") +
    ">Next</button></div></div>"
  );
}
function applicationFields(record = {}) {
  const c = state.catalog;
  return (
    '<div class="form-grid">' +
    field("full_name", "Full name", record.full_name) +
    field(
      "preferred_name",
      "Preferred name (optional)",
      record.preferred_name,
      "text",
      false,
    ) +
    field("email", "Email address", record.email, "email") +
    field("phone", "Phone", record.phone || "", "tel") +
    field(
      "address_line1",
      "Address Line 1 — House number / name",
      record.address_line1,
    ) +
    field(
      "address_line2",
      "Address Line 2 — Street / village",
      record.address_line2,
      "text",
      false,
    ) +
    field("address_city", "City / Town", record.address_city) +
    select(
      "course_id",
      "Preferred course",
      c.courses.filter((x) => x.active || x.id === record.course_id),
      record.course_id,
    ) +
    select(
      "current_level",
      "Current Japanese level",
      ["Beginner / No experience", "N5", "N4", "N3", "N2", "N1"],
      record.current_level,
    ) +
    select("category", "Registration Category", c.categories, record.category) +
    select(
      "intake_id",
      "Visa intake year and month",
      c.intakes.filter((x) => x.active || x.id === record.intake_id),
      record.intake_id,
    ) +
    '<div class="full" data-guardian-fields><h3>Guardian contact details</h3><div class="form-grid">' +
    field(
      "guardian_name",
      "Guardian name",
      record.guardian_name,
      "text",
      false,
    ) +
    field(
      "guardian_email",
      "Guardian email",
      record.guardian_email,
      "email",
      false,
    ) +
    field(
      "guardian_phone",
      "Guardian phone",
      record.guardian_phone,
      "tel",
      false,
    ) +
    select(
      "contact_recipient",
      "Preferred contact recipient",
      [
        { id: "student", name: "Student" },
        { id: "guardian", name: "Guardian" },
      ],
      record.contact_recipient || "student",
    ) +
    "</div></div>" +
    field(
      "existing_student_number",
      "Existing student number (optional)",
      record.existing_student_id ? record.student_number || "" : "",
      "text",
      false,
    ) +
    '<input type="hidden" name="existing_student_id" value="' +
    h(record.existing_student_id || record.student_id || "") +
    '"><p class="form-help full">A student can have only one registration. Edit their existing record to change category or course. Use a student number here only for a legacy student who has no registration.</p>' +
    textarea(
      "message",
      "Additional message (optional)",
      record.message || "",
      3,
    ) +
    "</div>"
  );
}
function bindRegistrationFields(form) {
  const update = () => {
    const visa = form.elements.category.value === "visa",
      kids = form.elements.category.value === "kids",
      guardian = kids && form.elements.contact_recipient.value === "guardian";
    for (const name of ["phone", "guardian_phone"]) {
      form.elements[name].placeholder = "077 123 4567";
      form.elements[name].maxLength = 20;
    }
    form.elements.intake_id.closest("label").hidden = !visa;
    form.elements.intake_id.required = visa;
    form.elements.intake_id.disabled = !visa;
    if (!visa) form.elements.intake_id.value = "";
    form.querySelector("[data-guardian-fields]").hidden = !kids;
    for (const key of [
      "guardian_name",
      "guardian_email",
      "guardian_phone",
      "contact_recipient",
    ])
      form.elements[key].disabled = !kids;
    form.elements.email.required = !guardian;
    form.elements.phone.required = !guardian;
    for (const key of ["guardian_name", "guardian_email", "guardian_phone"])
      form.elements[key].required = guardian;
  };
  form.elements.category.addEventListener("change", update);
  form.elements.contact_recipient.addEventListener("change", update);
  update();
  form.elements.existing_student_number.addEventListener("input", () => {
    form.elements.existing_student_id.value = "";
  });
}
async function resolveExistingStudent(form, data) {
  const number = data.existing_student_number?.trim();
  if (number) {
    const result = await api(
      "/api/admin/students?search=" + encodeURIComponent(number) + "&limit=100",
    );
    const match = result.rows.find((s) => s.student_number === number);
    if (!match)
      throw new Error(
        "No student uses that exact number. Check the number before saving.",
      );
    data.existing_student_id = match.id;
  }
  delete data.existing_student_number;
}
function acceptRegistration(p) {
  confirmAction(
    "Accept student",
    "Accept " +
      p.full_name +
      " and confirm their enrollment? " +
      (p.student_number
        ? "Keep student number " + p.student_number + "."
        : "Assign their permanent student number.") +
      " Send the acceptance email to " +
      (p.recipient_email || recipientEmail(p) || "the configured contact") +
      ".",
    async () => {
      const updated = await api("/api/admin/applications/" + p.id + "/accept", {
        method: "POST",
        body: { confirmed: true },
      });
      const notification = updated.enrollment_notification;
      toast(
        "Student accepted. Number: " +
          updated.student_number +
          ". Acceptance email: " +
          (notification?.email_status || "Failed") +
          ".",
        !!notification?.error || notification?.email_status === "Failed",
      );
      await render();
    },
  );
}
async function overviewPage() {
  const data = await api("/api/admin/overview");
  const m = data.metrics;
  $("#main").innerHTML =
    heading(
      "ADMISSIONS WORKSPACE",
      "Overview",
      "A clear view of registrations, enrollment, and communications.",
      button("new-registration", "Add registration", "primary", "plus"),
    ) +
    '<div class="metrics">' +
    [
      [
        "New registrations",
        m.new,
        "registrations?status=New",
        "inbox",
        "Ready for a first review",
      ],
      [
        "Awaiting review",
        m.reviewing,
        "registrations?status=awaiting",
        "clipboard-list",
        "New and reviewing applications",
      ],
      [
        "Accepted applicants",
        m.accepted,
        "registrations?status=Accepted",
        "circle-check",
        "Awaiting enrollment",
      ],
      [
        "Enrolled students",
        m.students,
        "students",
        "graduation-cap",
        "Enrolled student records",
      ],
    ]
      .map(
        ([title, n, link, ic, caption]) =>
          '<a class="metric" href="#' +
          link +
          '"><span class="metric-label">' +
          title +
          icon(ic) +
          "</span><strong>" +
          n +
          "</strong><small>" +
          caption +
          "</small></a>",
      )
      .join("") +
    "</div>" +
    (m.failed
      ? '<div class="notice"><span><strong>' +
        m.failed +
        " email" +
        (m.failed === 1 ? "" : "s") +
        ' need attention.</strong> Review the failure details before resending.</span><a class="btn small" href="#email?status=Failed">Review emails →</a></div>'
      : "") +
    '<div class="dashboard-grid">' +
    panel(
      "Recent registrations",
      data.recent.length
        ? '<div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Course / intake</th><th>Status</th></tr></thead><tbody>' +
            data.recent
              .map(
                (r) =>
                  '<tr><td><a class="record-link" href="#registration/' +
                  r.id +
                  '">' +
                  h(r.full_name) +
                  '</a><span class="secondary reference">' +
                  h(r.reference) +
                  "</span></td><td>" +
                  h(r.course_id) +
                  '<span class="secondary">' +
                  h(intakeLabel(r)) +
                  "</span></td><td>" +
                  h(r.enrollment_year || "—") +
                  " · " +
                  badge(r.status) +
                  "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>"
        : empty("No registrations yet", "New applications will appear here."),
      '<a class="btn text" href="#registrations">View all →</a>',
    ) +
    panel(
      "Recent activity",
      data.activity.length
        ? data.activity
            .map(
              (a) =>
                '<div class="activity-item"><p>' +
                h(a.action) +
                "</p><small>" +
                h(a.actor_name) +
                " · " +
                datetime(a.created_at) +
                "</small></div>",
            )
            .join("")
        : empty("No activity yet", "Actions are recorded as your team works."),
      '<a class="btn text" href="#activity">View log →</a>',
    ) +
    "</div>";
  handlers["new-registration"] = manualRegistration;
  handlers["accept-record"] = (_, button) =>
    acceptRegistration(result.rows.find((r) => r.id === button.dataset.id));
}

async function galleryPage() {
  const data = await api("/api/admin/gallery");
  $("#main").innerHTML =
    heading("PUBLIC WEBSITE", "Gallery", "Upload photos shown on the public gallery page.") +
    '<section class="panel"><div class="panel-head"><h2>Add a photo</h2></div><form data-handler="gallery-upload" class="form-grid"><label class="full">Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required></label>' +
    textarea("alt_text", "Short description (optional)", "", 2) +
    '<p class="form-help full">Use JPG, PNG, or WebP files smaller than 1.8 MB.</p><p class="form-error full" role="alert"></p><button class="btn primary" type="submit">Upload photo</button></form></section>' +
    panel("Published photos", data.images.length ? '<div class="gallery-admin-grid">' + data.images.map((image) => '<article class="gallery-admin-card"><img src="' + h(image.image_data) + '" alt="' + h(image.alt_text || "Gallery image") + '"><div><p>' + h(image.alt_text || "No description") + '</p>' + button("remove-gallery-" + image.id, "Remove", "danger", "trash-2") + '</div></article>').join("") + "</div>" : empty("No gallery photos yet", "Upload the first photo for the public gallery.", "images"));
  forms["gallery-upload"] = async (form) => {
    const file = form.elements.photo.files[0];
    if (!file) throw new Error("Choose a photo to upload.");
    if (file.size > 1800000) throw new Error("Image must be smaller than 1.8 MB.");
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read this image."));
      reader.readAsDataURL(file);
    });
    await api("/api/admin/gallery", { method: "POST", body: { image, alt_text: form.elements.alt_text.value } });
    toast("Gallery photo uploaded.");
    render();
  };
  data.images.forEach((image) => {
    handlers["remove-gallery-" + image.id] = () => confirmAction("Remove photo", "This removes the photo from the public gallery.", async () => {
      await api("/api/admin/gallery/" + image.id, { method: "DELETE", body: {} });
      toast("Gallery photo removed.");
      render();
    });
  });
}
function filtersHtml(params, students = false) {
  const c = state.catalog;
  return (
    '<form class="filters" data-handler="filters"><label class="search-field">Search<input name="search" value="' +
    h(params.get("search")) +
    '" placeholder="Name, email, phone, reference, or student number"></label>' +
    select(
      "category",
      "Registration category",
      c.categories,
      params.get("category"),
      false,
      "All categories",
    ) +
    field("year", "Enrollment year", params.get("year"), "number", false) +
    (!students
      ? select(
          "course",
          "Course",
          c.courses,
          params.get("course"),
          false,
          "All courses",
        ) +
        select(
          "intake",
          "Intake",
          c.intakes,
          params.get("intake"),
          false,
          "All intakes",
        ) +
        select(
          "status",
          "Status",
          [
            { id: "awaiting", name: "Awaiting review (new + reviewing)" },
            ...c.statuses,
          ],
          params.get("status"),
          false,
          "All statuses",
        ) +
        select(
          "assigned",
          "Assigned to",
          [{ id: "unassigned", name: "Unassigned" }, ...c.staff],
          params.get("assigned"),
          false,
          "All staff",
        )
      : select(
          "intake",
          "Visa intake",
          c.intakes,
          params.get("intake"),
          false,
          "All visa intakes",
        ) +
        select(
          "status",
          "Enrollment status",
          ["Enrolled", "Completed", "Withdrawn"],
          params.get("status"),
          false,
          "All statuses",
        )) +
    select(
      "sort",
      "Sort by",
      [
        { id: "created", name: "Registration date" },
        { id: "name", name: "Name" },
        ...(!students
          ? [
              { id: "status", name: "Status" },
              { id: "course", name: "Course" },
              { id: "intake", name: "Intake" },
            ]
          : []),
      ],
      params.get("sort") || "created",
      false,
      "Default",
    ) +
    select(
      "direction",
      "Order",
      [
        { id: "desc", name: "Newest / descending" },
        { id: "asc", name: "Oldest / ascending" },
      ],
      params.get("direction") || "desc",
      false,
      "Default",
    ) +
    button("apply-filters", "Apply filters", "primary") +
    button("reset-filters", "Clear") +
    (!students
      ? '<div class="filter-dates">' +
        field("from", "From date", params.get("from"), "date", false) +
        field("to", "To date", params.get("to"), "date", false) +
        check(
          "archived",
          "Archived registrations",
          params.get("archived") === "true",
        ) +
        "</div>"
      : "") +
    "</form>"
  );
}
async function recordsPage(params, students = false) {
  const review = students
    ? await api("/api/admin/student-number-review")
    : { rows: [] };
  const base = students ? "students" : "applications";
  if (state.selectedSource !== base) {
    state.selected.clear();
    state.selectedSource = base;
  }
  const route = students ? "students" : "registrations",
    result = await api("/api/admin/" + base + "?" + params);
  const selected = state.selected;
  $("#main").innerHTML =
    heading(
      "STUDENT RECORDS",
      students ? "Students" : "Registrations",
      students
        ? "Enrolled students and their original applications."
        : "Review applications, follow up, and prepare students for enrollment.",
      (can("export")
        ? '<a class="btn" href="/api/admin/' +
          base +
          "/export?" +
          h(params.toString()) +
          '">' +
          icon("download") +
          "Export CSV</a>"
        : "") +
        (!students
          ? button("new-registration", "Add registration", "primary", "plus")
          : ""),
    ) +
    (review.rows.length
      ? panel(
          "Legacy student number review",
          '<div class="panel-body">' +
            review.rows
              .map(
                (r) =>
                  '<div class="note"><a href="#' +
                  (r.student_id
                    ? "student/" + r.student_id
                    : "registration/" + r.application_id) +
                  '">' +
                  h(r.student_name || r.applicant_name) +
                  " · " +
                  h(r.number) +
                  "</a><p>" +
                  h(r.reason) +
                  "</p></div>",
              )
              .join("") +
            "</div>",
        )
      : "") +
    '<section class="panel">' +
    filtersHtml(params, students) +
    '<div class="bulk-bar" id="bulk-bar" ' +
    (!selected.size ? "hidden" : "") +
    '><strong id="selection-count">' +
    selected.size +
    " selected</strong>" +
    (!students ? button("bulk-status", "Change status", "small") : "") +
    (can("email")
      ? button("email-selected", "Email selected", "small", "mail")
      : "") +
    button("clear-selection", "Clear selection", "small") +
    '</div><div class="table-wrap">' +
    (result.rows.length
      ? '<table><thead><tr><th><input type="checkbox" id="select-all" aria-label="Select this page"></th><th>' +
        (students ? "Student" : "Applicant") +
        "</th><th>Contact</th>" +
        (students
          ? "<th>Course / intake</th><th>Year / status</th>"
          : "<th>Course / intake</th><th>Year / status</th><th>Student number</th><th>Assigned</th>") +
        "<th>Registered</th><th></th></tr></thead><tbody>" +
        result.rows
          .map(
            (r) =>
              '<tr><td><input class="record-check" data-id="' +
              r.id +
              '" type="checkbox" aria-label="Select ' +
              h(r.full_name) +
              '" ' +
              (selected.has(r.id) ? "checked" : "") +
              '></td><td><div class="contact-cell"><span class="avatar">' +
              h(
                r.full_name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join(""),
              ) +
              '</span><div><a class="record-link" href="#' +
              (students ? "student" : "registration") +
              "/" +
              r.id +
              '">' +
              h(r.full_name) +
              '</a><span class="secondary reference">' +
              h(students ? r.student_number : r.reference) +
              (students && r.reference
                ? '<span class="secondary reference">' +
                  h(r.reference) +
                  "</span>"
                : "") +
              (students
                ? ""
                : r.student_number
                  ? " · " + h(r.student_number)
                  : "") +
              '<span class="secondary">' +
              h(categoryLabel(r.registration_category || r.category)) +
              "</span>" +
              (r.duplicate_of ? " · Potential duplicate" : "") +
              "</span></div></div></td><td>" +
              h(recipientEmail(r)) +
              (r.category === "kids" || r.registration_category === "kids"
                ? " (" + h(r.contact_recipient) + ")"
                : "") +
              '<span class="secondary">' +
              h(
                (r.category === "kids" || r.registration_category === "kids") &&
                  r.contact_recipient === "guardian"
                  ? r.guardian_phone
                  : r.phone,
              ) +
              "</span></td>" +
              (students
                ? "<td>" +
                  h(r.course_name || r.course_id || "—") +
                  '<span class="secondary">' +
                  h(intakeLabel(r)) +
                  "</span></td><td>" +
                  h(r.enrollment_year || "—") +
                  badge(r.status || "Enrolled") +
                  "</td>"
                : "<td>" +
                  h(r.course_id) +
                  '<span class="secondary">' +
                  h(r.intake_name || "Not specified") +
                  "</span></td><td>" +
                  badge(r.status) +
                  "</td><td>" +
                  (r.student_number
                    ? '<strong class="student-number">' + h(r.student_number) + "</strong>"
                    : '<span class="secondary">Assigned after acceptance</span>') +
                  "</td><td>" +
                  h(r.assigned_name || "Unassigned") +
                  "</td>") +
              "<td>" +
              date(r.created_at) +
              '</td><td><a class="btn small" href="#' +
              (students ? "student" : "registration") +
              "/" +
              r.id +
              '">Open →</a>' +
              (!students && !r.archived_at && !r.student_id
                ? '<button class="btn small primary" data-action="accept-record" data-id="' +
                  r.id +
                  '">Accept</button>'
                : "") +
              "</td></tr>",
          )
          .join("") +
        "</tbody></table>"
      : empty("No matching records", "Try changing the search or filters.")) +
    "</div>" +
    pager(result) +
    "</section>";
  const navigate = () => {
    const form = $('[data-handler="filters"]'),
      values = Object.fromEntries(new FormData(form)),
      p = new URLSearchParams();
    for (const [key, value] of Object.entries(values))
      if (value) p.set(key, key === "archived" ? "true" : value);
    state.selected.clear();
    go(route + "?" + p);
  };
  forms.filters = navigate;
  handlers["apply-filters"] = navigate;
  handlers["reset-filters"] = () => {
    selected.clear();
    go(route);
  };
  handlers["previous-page"] = () => {
    params.set("page", result.page - 1);
    go(route + "?" + params);
  };
  handlers["next-page"] = () => {
    params.set("page", result.page + 1);
    go(route + "?" + params);
  };
  handlers["new-registration"] = manualRegistration;
  const updateSelection = () => {
    const count = selected.size;
    $("#bulk-bar").hidden = !count;
    $("#selection-count").textContent = count + " selected";
    $("#select-all") &&
      ($("#select-all").checked =
        result.rows.length > 0 && result.rows.every((r) => selected.has(r.id)));
  };
  $("#select-all")?.addEventListener("change", (event) => {
    for (const row of result.rows) {
      if (event.target.checked) selected.add(row.id);
      else selected.delete(row.id);
    }
    document
      .querySelectorAll(".record-check")
      .forEach((box) => (box.checked = selected.has(box.dataset.id)));
    updateSelection();
  });
  document.querySelectorAll(".record-check").forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked) selected.add(box.dataset.id);
      else selected.delete(box.dataset.id);
      updateSelection();
    }),
  );
  handlers["clear-selection"] = () => {
    selected.clear();
    document
      .querySelectorAll(".record-check")
      .forEach((box) => (box.checked = false));
    updateSelection();
  };
  handlers["email-selected"] = () => {
    state.emailSelection = {
      mode: "selected",
      source: base,
      ids: [...selected],
    };
    go("email/compose");
  };
  handlers["bulk-status"] = () => {
    modal(
      "Update selected registrations",
      "<p>Choose a status for " +
        selected.size +
        " selected records.</p>" +
        select("bulk_status", "New status", state.catalog.statuses),
    );
    handlers["confirm-bulk"] = () => {
      const status = $("#modal select").value;
      if (!status) {
        toast("Choose a status.", true);
        return;
      }
      confirmAction(
        "Confirm status change",
        "Change " +
          selected.size +
          " selected registrations to " +
          status +
          "?" +
          (["Accepted", "Enrolled"].includes(status)
            ? " Permanent student numbers will be assigned and enrollment confirmation emails prepared. Existing identities keep their number."
            : ""),
        async () => {
          await api("/api/admin/applications/bulk", {
            method: "POST",
            body: { ids: [...selected], status, confirmed: true },
          });
          selected.clear();
          toast(
            status === "Enrolled"
              ? "Enrollment confirmed. Check Email Center for confirmation email status."
              : "Statuses updated.",
          );
          render();
        },
      );
    };
    $("#modal-content").insertAdjacentHTML(
      "beforeend",
      '<div class="modal-actions">' +
        button("close-modal", "Cancel") +
        button("confirm-bulk", "Review change", "primary") +
        "</div>",
    );
  };
}
function manualRegistration() {
  modal(
    "Add registration",
    '<p class="muted">Create a record for an applicant who contacted the institute directly.</p><form data-handler="manual-registration">' +
      applicationFields() +
      check(
        "privacy_acknowledged",
        "Privacy notice was acknowledged by the applicant",
      ) +
      check(
        "promotional_consent",
        "Applicant explicitly opted in to promotional email",
      ) +
      '<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save registration</button></form>',
  );
  bindRegistrationFields($('[data-handler="manual-registration"]'));
  const key = crypto.randomUUID();
  forms["manual-registration"] = async (form, data) => {
    await resolveExistingStudent(form, data);
    data.idempotencyKey = key;
    data.privacy_acknowledged = form.elements.privacy_acknowledged.checked;
    data.promotional_consent = form.elements.promotional_consent.checked;
    const result = await api("/api/admin/applications", {
      method: "POST",
      body: data,
    });
    $("#modal").close();
    toast("Registration saved.");
    go("registration/" + result.id);
  };
}
async function profilePage(recordId, student = false) {
  const p = await api(
    "/api/admin/" + (student ? "students" : "applications") + "/" + recordId,
  );
  const details = student
    ? [
        ["Student number", p.student_number],
        ["Registration category", categoryLabel(p.category)],
        ["Course level", p.course_name || p.course_id],
        ["Intake", intakeLabel(p)],
        ["Enrollment year", p.enrollment_year],
        ["Enrollment status", p.status],
        ["Number assigned as", categoryLabel(p.original_category)],
        ["Number generation year", p.original_year],
        ["Email", p.email],
        ["Phone", p.phone],
        ["Address Line 1", p.address_line1 || "Not recorded"],
        ["Address Line 2", p.address_line2 || "—"],
        ["City / Town", p.address_city || "Not recorded"],
        ["Preferred name", p.preferred_name || "—"],
        ["Joined", datetime(p.created_at)],
      ]
    : [
        [
          "Student number",
          p.student_number || "Assigned when enrollment is confirmed",
        ],
        ["Email", p.email],
        ["Phone", p.phone],
        ["Address Line 1", p.address_line1 || "Not recorded"],
        ["Address Line 2", p.address_line2 || "—"],
        ["City / Town", p.address_city || "Not recorded"],
        ["Preferred name", p.preferred_name || "—"],
        ["Preferred course", p.course_name],
        ["Current Japanese level", p.current_level],
        ["Intake", intakeLabel(p)],
        ["Enrollment year", p.enrollment_year || "Assigned on enrollment"],
        ["Registration category", categoryLabel(p.category)],
        ["Registered", datetime(p.created_at)],
        [
          "Privacy acknowledged",
          p.privacy_acknowledged ? "Yes" : "Not recorded",
        ],
        [
          "Promotional consent",
          p.promotional_consent && !p.unsubscribed
            ? "Opted in"
            : "Not eligible",
        ],
      ];
  if (p.category === "kids")
    details.push(
      ["Guardian name", p.guardian_name],
      ["Guardian email", p.guardian_email],
      ["Guardian phone", p.guardian_phone],
      ["Preferred recipient", p.contact_recipient],
      ["Actual email recipient", p.recipient_email || recipientEmail(p)],
    );
  $("#main").innerHTML =
    heading(
      student ? "STUDENT PROFILE" : "APPLICATION PROFILE",
      p.full_name,
      student ? p.student_number : p.reference,
      (!student && !p.archived_at && !p.enrollment_notification
        ? button("accept-profile", "Accept student", "primary", "check")
        : "") +
        button("edit-profile", "Edit details", "", "pencil") +
        (can("email")
          ? button("email-profile", "Email", "primary", "mail")
          : ""),
    ) +
    (!student && p.duplicate_of
      ? '<div class="notice info"><span>Potential duplicate: another application uses this email address. Review the related record before making changes.</span><a class="btn small" href="#registration/' +
        p.duplicate_of +
        '">Review record →</a></div>'
      : "") +
    (!student && p.enrollment_notification
      ? '<div class="notice ' +
        (p.enrollment_notification.error ||
        p.enrollment_notification.email_status === "Failed"
          ? "error"
          : "info") +
        '"><span><strong>Confirmation email: ' +
        h(p.enrollment_notification.email_status || "Failed") +
        ".</strong> " +
        h(
          p.enrollment_notification.email_error ||
            p.enrollment_notification.error ||
            "The permanent student number is included in the enrollment email.",
        ) +
        "</span>" +
        (can("email") && p.enrollment_notification.campaign_id
          ? '<a class="btn small" href="#email/message/' +
            p.enrollment_notification.campaign_id +
            '">View email →</a>'
          : "") +
        "</div>"
      : "") +
    '<div class="profile-layout"><div>' +
    panel(
      "Contact & study details",
      '<div class="panel-body"><dl class="key-values">' +
        details
          .map(
            ([label, value]) =>
              "<div><dt>" +
              label +
              "</dt><dd>" +
              h(value || "—") +
              "</dd></div>",
          )
          .join("") +
        "</dl>" +
        (!student && p.message
          ? '<hr class="section-divider"><h3>Applicant message</h3><p class="text-wrap">' +
            h(p.message) +
            "</p>"
          : "") +
        "</div>",
    ) +
    panel(
      "Internal notes",
      '<div class="panel-body">' +
        (p.notes.length
          ? p.notes
              .map(
                (n) =>
                  '<div class="note"><p>' +
                  h(n.body) +
                  "</p><small>" +
                  h(n.actor_name || "Staff") +
                  " · " +
                  datetime(n.created_at) +
                  "</small></div>",
              )
              .join("")
          : '<p class="muted">No internal notes yet.</p>') +
        '<form data-handler="add-note">' +
        textarea("note", "Add a note", "", 3, true) +
        '<button type="submit" class="btn">Add note</button><p class="form-error" role="alert"></p></form></div>',
    ) +
    panel(
      "Email history",
      p.emails.length
        ? '<div class="table-wrap"><table><thead><tr><th>Subject</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
            p.emails
              .map(
                (e) =>
                  '<tr><td class="text-wrap">' +
                  h(e.subject) +
                  (e.error
                    ? '<span class="secondary danger-text">' +
                      h(e.error) +
                      "</span>"
                    : "") +
                  "</td><td>" +
                  badge(e.status) +
                  "</td><td>" +
                  datetime(e.created_at) +
                  "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>"
        : empty("No emails yet", "Student communications appear here.", "mail"),
    ) +
    panel(
      "Enrollment history",
      '<div class="panel-body">' +
        ((p.enrollment_history || [])
          .map(
            (e) =>
              '<div class="note"><p>' +
              h(categoryLabel(e.category)) +
              " · " +
              h(e.course_id) +
              " · " +
              h(e.category === "visa" ? e.intake_id : "Not applicable") +
              " · " +
              h(e.enrollment_year) +
              "</p><small>" +
              h(e.actor_name || "Legacy import") +
              " · " +
              datetime(e.created_at) +
              "</small></div>",
          )
          .join("") ||
          '<p class="muted">Enrollment has not been confirmed.</p>') +
        "</div>",
    ) +
    "</div><div>" +
    (!student
      ? panel(
          "Application management",
          '<div class="panel-body"><form data-handler="manage-profile">' +
            select(
              "status",
              "Application status",
              state.catalog.statuses,
              p.status,
            ) +
            select(
              "assigned_to",
              "Assigned staff",
              state.catalog.staff,
              p.assigned_to,
              false,
              "Unassigned",
            ) +
            (p.enrollment
              ? select(
                  "enrollment_status",
                  "Enrollment status",
                  ["Enrolled", "Completed", "Withdrawn"],
                  p.enrollment.status,
                )
              : "") +
            field(
              "tags",
              "Tags (comma separated)",
              p.tags.join(", "),
              "text",
              false,
            ) +
            '<button type="submit" class="btn primary">Save changes</button><p class="form-error" role="alert"></p></form><hr class="section-divider">' +
            (p.student_id
              ? '<a class="btn text" href="#student/' +
                p.student_id +
                '">Open linked student →</a><br>'
              : "") +
            (can("email") &&
            p.enrollment_notification &&
            (p.enrollment_notification.error ||
              p.enrollment_notification.email_status === "Failed")
              ? button(
                  "retry-enrollment-email",
                  "Retry confirmation email",
                  "small",
                  "mail",
                )
              : "") +
            button(
              "archive-profile",
              p.archived_at ? "Restore registration" : "Archive registration",
              "danger small",
              "archive",
            ) +
            "</div>",
        )
      : panel(
          "Related applications",
          '<div class="panel-body">' +
            p.applications
              .map(
                (a) =>
                  '<div class="note"><a class="record-link reference" href="#registration/' +
                  a.id +
                  '">' +
                  h(a.reference) +
                  "</a><p>" +
                  h(a.course_id) +
                  " · " +
                  h(a.category === "visa" ? a.intake_id : "Not applicable") +
                  "</p>" +
                  badge(a.status) +
                  "</div>",
              )
              .join("") +
            "</div>",
        )) +
    panel(
      student ? "Activity timeline" : "Status history",
      '<div class="panel-body">' +
        (student ? p.activity : p.history)
          .map(
            (a) =>
              '<div class="timeline-item"><p>' +
              h(a.action || a.to_status) +
              "</p><small>" +
              h(a.actor_name || "Public applicant") +
              " · " +
              datetime(a.created_at) +
              "</small></div>",
          )
          .join("") +
        "</div>",
    ) +
    (!student
      ? panel(
          "Activity timeline",
          '<div class="panel-body">' +
            p.activity
              .map(
                (a) =>
                  '<div class="timeline-item"><p>' +
                  h(a.action) +
                  "</p><small>" +
                  h(a.actor_name) +
                  " · " +
                  datetime(a.created_at) +
                  "</small></div>",
              )
              .join("") +
            "</div>",
        )
      : "") +
    "</div></div>";
  forms["add-note"] = async (form, data) => {
    await api(
      "/api/admin/" + (student ? "students" : "applications") + "/" + p.id,
      { method: "PATCH", body: { note: data.note } },
    );
    toast("Note added.");
    render();
  };
  forms["manage-profile"] = async (form, data) => {
    const save = async () => {
      const updated = await api("/api/admin/applications/" + p.id, {
        method: "PATCH",
        body: {
          status: data.status,
          enrollment_confirmed: ["Accepted", "Enrolled"].includes(data.status),
          ...(p.enrollment
            ? { enrollment_status: data.enrollment_status }
            : {}),
          assigned_to: data.assigned_to,
          tags: data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      if (
        ["Accepted", "Enrolled"].includes(data.status) &&
        updated.enrollment_notification
      )
        toast(
          "Enrollment confirmed. Student number: " +
            updated.student_number +
            ". Confirmation email: " +
            (updated.enrollment_notification.email_status || "Failed") +
            ".",
          updated.enrollment_notification.email_status === "Failed" ||
            !!updated.enrollment_notification.error,
        );
      else toast("Application updated.");
      render();
    };
    if (data.status === "Enrolled" && p.status !== "Enrolled")
      confirmAction(
        "Confirm enrollment",
        "Confirm enrollment for " +
          p.full_name +
          " in " +
          categoryLabel(p.category) +
          "? " +
          (p.student_number
            ? "Keep assigned number " + p.student_number + "."
            : p.existing_student_id
              ? "Keep the linked existing student identity and number."
              : "Assign a permanent student number using the category numbering system, or keep a matching returning student identity.") +
          " Intake: " +
          intakeLabel(p) +
          ". Email recipient: " +
          (p.recipient_email ||
            recipientEmail(p) ||
            "Missing — review contact details") +
          ". The confirmation email will be prepared after saving enrollment.",
        save,
      );
    else if (data.status === "Accepted" && p.status !== "Accepted")
      confirmAction(
        "Confirm acceptance",
        "Accept this student and confirm enrollment? Their permanent student number will be assigned, and an acceptance email with the number will be prepared for " +
          (p.recipient_email || recipientEmail(p)) +
          ".",
        save,
      );
    else await save();
  };
  handlers["retry-enrollment-email"] = () =>
    confirmAction(
      "Retry confirmation email",
      "Retry the saved enrollment confirmation for " +
        p.full_name +
        " to " +
        (p.enrollment_notification?.recipient_email ||
          p.recipient_email ||
          recipientEmail(p) ||
          "the configured recipient") +
        "? The student number stays unchanged. If a prior send was attempted, confirm with your SMTP provider that resending is appropriate.",
      async () => {
        await api(
          "/api/admin/applications/" + p.id + "/retry-enrollment-email",
          {
            method: "POST",
            body: { confirmed: true, uncertain_acknowledged: true },
          },
        );
        toast("Enrollment email queued; student number unchanged.");
        render();
      },
    );
  handlers["archive-profile"] = () =>
    confirmAction(
      p.archived_at ? "Restore registration" : "Archive registration",
      p.archived_at
        ? "Return this registration to the active list?"
        : "Archive this application? You can restore it later.",
      async () => {
        await api("/api/admin/applications/" + p.id, {
          method: "PATCH",
          body: { archived: !p.archived_at },
        });
        toast(
          p.archived_at ? "Registration restored." : "Registration archived.",
        );
        render();
      },
    );
  handlers["accept-profile"] = () => acceptRegistration(p);
  handlers["email-profile"] = () => {
    state.emailSelection = {
      mode: "selected",
      source: student ? "students" : "applications",
      ids: [p.id],
    };
    go("email/compose");
  };
  handlers["edit-profile"] = () => {
    const inputs = student
      ? '<div class="form-grid">' +
        field("full_name", "Full name", p.full_name) +
        field(
          "preferred_name",
          "Preferred name",
          p.preferred_name,
          "text",
          false,
        ) +
        field(
          "email",
          "Student email",
          p.email,
          "email",
          p.category !== "kids" || p.contact_recipient !== "guardian",
        ) +
        field(
          "phone",
          "Student phone",
          p.phone,
          "tel",
          p.category !== "kids" || p.contact_recipient !== "guardian",
        ) +
        field(
          "address_line1",
          "Address Line 1 — House number / name",
          p.address_line1,
        ) +
        field(
          "address_line2",
          "Address Line 2 — Street / village",
          p.address_line2,
          "text",
          false,
        ) +
        field("address_city", "City / Town", p.address_city) +
        (p.category === "kids"
          ? field(
              "guardian_name",
              "Guardian name",
              p.guardian_name,
              "text",
              false,
            ) +
            field(
              "guardian_email",
              "Guardian email",
              p.guardian_email,
              "email",
              false,
            ) +
            field(
              "guardian_phone",
              "Guardian phone",
              p.guardian_phone,
              "tel",
              false,
            ) +
            select(
              "contact_recipient",
              "Preferred contact recipient",
              ["student", "guardian"],
              p.contact_recipient,
            )
          : "") +
        "</div>"
      : applicationFields(p);
    modal(
      "Edit profile",
      '<form data-handler="edit-profile">' +
        inputs +
        '<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save details</button></form>',
    );
    if (!student) bindRegistrationFields($('[data-handler="edit-profile"]'));
    forms["edit-profile"] = async (form, data) => {
      if (!student) await resolveExistingStudent(form, data);
      if (!student) {
        data.privacy_acknowledged = !!p.privacy_acknowledged;
        data.promotional_consent = !!p.promotional_consent;
      }
      await api(
        "/api/admin/" + (student ? "students" : "applications") + "/" + p.id,
        { method: "PATCH", body: student ? data : { details: data } },
      );
      $("#modal").close();
      toast("Details updated.");
      render();
    };
  };
}
async function activityPage(params) {
  const result = await api("/api/admin/activity?" + params);
  $("#main").innerHTML =
    heading(
      "ACCOUNTABILITY",
      "Activity Log",
      "A record of application changes, enrollment, and administrative actions.",
    ) +
    panel(
      "All activity",
      result.rows.length
        ? '<div class="table-wrap"><table><thead><tr><th>Action</th><th>Actor</th><th>Record</th><th>Timestamp</th></tr></thead><tbody>' +
            result.rows
              .map(
                (a) =>
                  "<tr><td>" +
                  h(a.action) +
                  "</td><td>" +
                  h(a.actor_name) +
                  '</td><td><span class="badge">' +
                  h(a.record_type) +
                  "</span> " +
                  (a.record_type === "application" && a.record_id
                    ? '<a class="reference" href="#registration/' +
                      h(a.record_id) +
                      '">' +
                      h(a.record_id.slice(0, 8)) +
                      " →</a>"
                    : '<span class="reference">' +
                      h(a.record_id?.slice(0, 8) || "—") +
                      "</span>") +
                  "</td><td>" +
                  datetime(a.created_at) +
                  "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>" +
            pager(result)
        : empty("No activity yet", "Your team’s actions will appear here."),
    );
  handlers["previous-page"] = () => go("activity?page=" + (result.page - 1));
  handlers["next-page"] = () => go("activity?page=" + (result.page + 1));
}

const variables = [
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
function editorFields(data = {}) {
  return (
    field("subject", "Subject", data.subject || "") +
    '<label>HTML content <span class="form-help">Format your message below. Preview shows the branded email your student will receive.</span><div class="toolbar">' +
    [
      ["strong", "Bold"],
      ["em", "Italic"],
      ["p", "Paragraph"],
      ["ul", "List"],
      ["a", "Link"],
    ]
      .map(
        ([tag, label]) =>
          '<button type="button" data-action="format-' +
          tag +
          '">' +
          label +
          "</button>",
      )
      .join("") +
    '</div><textarea class="html-editor" id="html-editor" name="html" rows="8" required>' +
    h(data.html || "<p>Hello {{first_name}},</p><p></p>") +
    '</textarea></label><div class="variable-list" aria-label="Personalization variables">' +
    variables
      .map(
        (v) =>
          '<button type="button" data-action="insert-variable" data-variable="' +
          v +
          '">{{' +
          v +
          "}}</button>",
      )
      .join("") +
    "</div>" +
    textarea(
      "text",
      "Plain-text alternative",
      data.text || "Hello {{first_name}},\n",
      6,
      true,
    ) +
    '<p class="form-help">Personalize each message with the buttons above. Student records include the assigned student number; applicants receive it automatically after enrollment.</p>' +
    select(
      "kind",
      "Email purpose",
      [
        { id: "operational", name: "Operational student communication" },
        { id: "promotional", name: "Promotional — consent required" },
      ],
      data.kind || "operational",
    )
  );
}
function bindEditor() {
  const insert = (before, after = "") => {
    const editor = $("#html-editor"),
      start = editor.selectionStart,
      end = editor.selectionEnd,
      selected = editor.value.slice(start, end);
    editor.setRangeText(before + selected + after, start, end, "end");
    editor.focus();
  };
  handlers["format-strong"] = () => insert("<strong>", "</strong>");
  handlers["format-em"] = () => insert("<em>", "</em>");
  handlers["format-p"] = () => insert("<p>", "</p>");
  handlers["format-ul"] = () => insert("<ul><li>", "</li></ul>");
  handlers["format-a"] = () => insert('<a href="https://example.com">', "</a>");
  handlers["insert-variable"] = (_, button) =>
    insert("{{" + button.dataset.variable + "}}");
}
async function previewContent(data) {
  const result = await api("/api/admin/email/preview", {
    method: "POST",
    body: data,
  });
  modal(
    "Email preview · sample data",
    '<p class="muted">This preview uses clearly labeled sample data. No email will be sent.</p><h3>' +
      h(result.subject) +
      '</h3><iframe class="preview-frame" sandbox="" title="Sample personalized email" id="email-preview"></iframe><hr class="section-divider"><h3>Plain-text alternative</h3><pre class="text-wrap">' +
      h(result.text) +
      "</pre>",
  );
  $("#email-preview").srcdoc = result.html;
}
async function templatesPage(params) {
  const data = await api("/api/admin/templates?" + params);
  $("#main").innerHTML =
    heading(
      "COMMUNICATIONS",
      "Templates",
      "Reusable, personalized messages for the student journey.",
      button(
        "toggle-archived",
        params.get("archived") === "true"
          ? "Active templates"
          : "Archived templates",
      ) +
        (isAdmin()
          ? button("new-template", "New template", "primary", "plus")
          : ""),
    ) +
    '<div class="template-grid">' +
    data.rows
      .map(
        (t) =>
          '<article class="template-card"><div class="template-card-top"><div class="template-icon">' +
          icon("file-text") +
          "</div>" +
          badge(t.kind) +
          "</div><h3>" +
          h(t.name) +
          "</h3><p>" +
          h(t.subject) +
          "</p>" +
          '<div class="actions">' +
          button("preview-template", "Preview", "small") +
          (isAdmin()
            ? button("edit-template", "Edit", "small") +
              button("duplicate-template", "Duplicate", "small") +
              button(
                "archive-template",
                t.archived_at ? "Restore" : "Archive",
                "small danger",
              )
            : "") +
          '</div><span class="hidden template-id">' +
          h(t.id) +
          "</span></article>",
      )
      .join("") +
    "</div>" +
    (data.rows.length
      ? ""
      : empty(
          "No templates here",
          "Create a template to start communicating.",
          "file-text",
        ));
  const selected = (button) =>
    data.rows.find(
      (t) =>
        t.id ===
        button.closest(".template-card").querySelector(".template-id")
          .textContent,
    );
  handlers["toggle-archived"] = () =>
    go(
      params.get("archived") === "true"
        ? "templates"
        : "templates?archived=true",
    );
  handlers["preview-template"] = (_, b) => previewContent(selected(b));
  handlers["new-template"] = () => editTemplate();
  handlers["edit-template"] = (_, b) => editTemplate(selected(b));
  handlers["duplicate-template"] = async (_, b) => {
    const t = selected(b);
    await api("/api/admin/templates", {
      method: "POST",
      body: { ...t, name: t.name + " (copy)" },
    });
    toast("Template duplicated.");
    render();
  };
  handlers["archive-template"] = (_, b) => {
    const t = selected(b);
    confirmAction(
      t.archived_at ? "Restore template" : "Archive template",
      t.archived_at
        ? "Make this template available again?"
        : "Archive this template? Previously prepared emails keep their original content.",
      async () => {
        await api("/api/admin/templates/" + t.id, {
          method: "PATCH",
          body: { archived: !t.archived_at },
        });
        toast("Template updated.");
        render();
      },
    );
  };
}
function editTemplate(template = {}) {
  modal(
    template.id ? "Edit template" : "New template",
    '<form class="template-editor-form" data-handler="save-template"><p class="template-editor-intro">Create a personal message. Tomoni branding and responsive styling are added automatically.</p>' +
      field("name", "Template name", template.name || "") +
      editorFields(template) +
      '<p class="form-error" role="alert"></p><div class="actions"><button type="submit" class="btn primary">Save template</button>' +
      button("preview-template-edit", "Preview") +
      (template.id ? button("test-template", "Send test email") : "") +
      "</div></form>",
  );
  bindEditor();
  forms["save-template"] = async (form, data) => {
    await api("/api/admin/templates" + (template.id ? "/" + template.id : ""), {
      method: template.id ? "PATCH" : "POST",
      body: data,
    });
    $("#modal").close();
    toast("Template saved.");
    render();
  };
  handlers["preview-template-edit"] = async () => {
    const data = Object.fromEntries(new FormData($("#modal form")));
    const result = await api("/api/admin/email/preview", {
      method: "POST",
      body: data,
    });
    let preview = $("#template-preview");
    if (!preview) {
      preview = document.createElement("section");
      preview.id = "template-preview";
      $("#modal form").appendChild(preview);
    }
    preview.innerHTML =
      '<hr class="section-divider"><h3>Preview · sample data</h3><iframe class="preview-frame" sandbox="" title="Sample personalized template"></iframe>';
    preview.querySelector("iframe").srcdoc = result.html;
  };
  handlers["test-template"] = () => testEmailDialog(template.id);
}
function testEmailDialog(templateId) {
  modal(
    "Send test email",
    '<p>This action sends a real email through the configured SMTP server. Live sending must be enabled.</p><form data-handler="send-test">' +
      field("recipient", "Test recipient email", "", "email") +
      check(
        "confirmed",
        "I confirm sending a real test email to this recipient.",
      ) +
      '<p class="form-error" role="alert"></p><button class="btn primary" type="submit">Send test email</button></form>',
  );
  forms["send-test"] = async (form, data) => {
    if (!form.elements.confirmed.checked)
      throw new Error("Confirm the test email before sending.");
    const result = await api("/api/admin/settings/smtp/send-test", {
      method: "POST",
      body: {
        recipient: data.recipient,
        template_id: templateId,
        confirmed: true,
      },
    });
    $("#modal").close();
    toast(result.message);
  };
}
async function emailPage(params) {
  const data = await api("/api/admin/email/campaigns?" + params);
  data.automationFailures = [
    ...(data.automationFailures || []),
    ...(data.enrollmentFailures || []),
  ];
  $("#main").innerHTML =
    heading(
      "COMMUNICATIONS",
      "Email Center",
      "Review drafts, sending progress, and messages needing attention.",
      button("compose", "Compose email", "primary", "mail"),
    ) +
    (!data.sendingEnabled
      ? '<div class="notice info"><span>Live email sending is disabled on this server. Drafts and recipient previews are available.</span>' +
        (isAdmin()
          ? '<a class="btn small" href="#settings?tab=smtp">SMTP settings →</a>'
          : "") +
        "</div>"
      : "") +
    (!data.smtpConfigured
      ? '<div class="notice"><span>SMTP is not configured. Registration confirmation emails are logged for your attention.</span></div>'
      : "") +
    (data.automationFailures?.length
      ? '<div class="notice error"><div><strong>Approval emails need attention</strong><ul>' +
        data.automationFailures
          .map(
            (item) =>
              "<li>" +
              h(item.full_name) +
              " (" +
              h(item.reference) +
              "): " +
              h(item.error) +
              "</li>",
          )
          .join("") +
        "</ul></div></div>"
      : "") +
    '<div class="tabs">' +
    ["All", "Draft", "Queued", "Sending", "Accepted by SMTP server", "Failed"]
      .map(
        (s) =>
          '<a class="tab ' +
          ((params.get("status") || "All") === s ? "active" : "") +
          '" href="#email' +
          (s === "All" ? "" : "?status=" + encodeURIComponent(s)) +
          '">' +
          h(s) +
          "</a>",
      )
      .join("") +
    "</div>" +
    panel(
      "Messages",
      data.rows.length
        ? '<div class="table-wrap"><table><thead><tr><th>Subject</th><th>Recipients</th><th>Status</th><th>Initiated by</th><th>Created</th><th></th></tr></thead><tbody>' +
            data.rows
              .map(
                (c) =>
                  '<tr><td class="text-wrap"><strong>' +
                  h(c.subject) +
                  '</strong><span class="secondary">' +
                  h(c.kind) +
                  "</span></td><td>" +
                  c.recipient_count +
                  (c.failed_count
                    ? '<span class="secondary danger-text">' +
                      c.failed_count +
                      " failed</span>"
                    : "") +
                  "</td><td>" +
                  badge(c.status) +
                  "</td><td>" +
                  h(c.actor_name || "Registration system") +
                  "</td><td>" +
                  datetime(c.created_at) +
                  '</td><td><a class="btn small" href="#email/message/' +
                  c.id +
                  '">Open →</a></td></tr>',
              )
              .join("") +
            "</tbody></table></div>"
        : empty(
            "No messages here",
            "Save a draft or prepare a student communication.",
            "mail",
          ),
    );
  handlers.compose = () => {
    state.emailSelection = null;
    go("email/compose");
  };
}
async function campaignPage(campaignId) {
  const c = await api("/api/admin/email/campaigns/" + campaignId);
  $("#main").innerHTML =
    heading(
      "EMAIL RECORD",
      c.subject,
      "Created " + datetime(c.created_at),
      button(
        "reuse-message",
        c.status === "Draft" ? "Continue draft" : "Create a new draft",
        "",
        "pencil",
      ),
    ) +
    '<div class="notice info"><span>SMTP acceptance confirms that the server accepted a message. It does not prove delivery or reading. Interrupted or ambiguous sends are not retried automatically.</span></div>' +
    panel(
      "Recipient history",
      '<div class="panel-body"><div class="actions">' +
        badge(c.status) +
        '<span class="muted">' +
        c.recipients.length +
        " frozen recipient" +
        (c.recipients.length === 1 ? "" : "s") +
        "</span></div></div>" +
        (c.recipients.length
          ? '<div class="table-wrap"><table><thead><tr><th>Recipient</th><th>Status</th><th>Attempts</th><th>SMTP accepted at</th><th>Error</th></tr></thead><tbody>' +
            c.recipients
              .map(
                (r) =>
                  "<tr><td>" +
                  h(r.full_name) +
                  '<span class="secondary">' +
                  h(r.email) +
                  "</span></td><td>" +
                  badge(r.status) +
                  "</td><td>" +
                  r.attempt_count +
                  "</td><td>" +
                  datetime(r.accepted_at) +
                  '</td><td class="text-wrap danger-text">' +
                  h(r.error || "—") +
                  "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>"
          : empty(
              "Draft only",
              "Prepare recipients from the composer before sending.",
              "mail",
            )),
    ) +
    panel(
      "Sending attempts",
      c.attempts.length
        ? '<div class="table-wrap"><table><thead><tr><th>Started</th><th>Finished</th><th>Status</th><th>Details</th></tr></thead><tbody>' +
            c.attempts
              .map(
                (a) =>
                  "<tr><td>" +
                  datetime(a.started_at) +
                  "</td><td>" +
                  datetime(a.finished_at) +
                  "</td><td>" +
                  badge(a.status) +
                  '</td><td class="text-wrap">' +
                  h(a.error || "SMTP accepted this attempt.") +
                  "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>"
        : empty(
            "No send attempts",
            "Messages remain queued until SMTP sending is enabled.",
            "clock",
          ),
    );
  handlers["reuse-message"] = () => {
    state.draft = { ...c, selection: JSON.parse(c.selection || "{}") };
    state.emailSelection = state.draft.selection;
    go("email/compose");
  };
}
async function composerPage() {
  const templates = (await api("/api/admin/templates")).rows;
  const draft = state.draft || {};
  state.draft = null;
  const initial = state.emailSelection || {
    mode: "selected",
    source: "applications",
    ids: [],
  };
  state.emailSelection = null;
  let selectedIds = new Set(initial.ids || []),
    recipientPageVersion = 0;
  $("#main").innerHTML =
    heading(
      "COMMUNICATIONS",
      "Compose email",
      "Prepare a personalized message, review recipients, then confirm the send.",
      '<a class="btn" href="#email">Back to Email Center</a>',
    ) +
    '<form data-handler="prepare-email" id="compose-form"><div class="composer-layout"><div>' +
    panel(
      "Message",
      '<div class="panel-body">' +
        select(
          "template_id",
          "Use a template",
          templates,
          draft.template_id || "",
          false,
          "Write a custom message",
        ) +
        editorFields(draft) +
        '<p class="form-error" role="alert"></p><div class="actions">' +
        button("preview-compose", "Preview with sample data") +
        button("save-draft", "Save draft") +
        "</div></div>",
    ) +
    "</div><div>" +
    panel(
      "Recipients",
      '<div class="panel-body">' +
        select(
          "source",
          "Record type",
          [
            { id: "applications", name: "Applicants" },
            { id: "students", name: "Enrolled students" },
          ],
          initial.source,
        ) +
        select(
          "recipient_mode",
          "Recipient selection",
          [
            { id: "selected", name: "Select individual records" },
            { id: "filtered", name: "Filtered group" },
            { id: "all", name: "All eligible records" },
          ],
          initial.mode,
        ) +
        '<div id="recipient-picker">' +
        field("recipient_search", "Search records", "", "text", false) +
        '<div class="recipient-list" id="recipient-options"><p class="muted">Loading recipients…</p></div><p id="recipient-selected" class="form-help"></p></div><div id="recipient-filters" class="hidden">' +
        select(
          "recipient_category",
          "Registration category",
          state.catalog.categories,
          initial.filters?.category || "",
          false,
          "All categories",
        ) +
        field(
          "recipient_year",
          "Enrollment year",
          initial.filters?.year || "",
          "number",
          false,
        ) +
        select(
          "recipient_course",
          "Course",
          state.catalog.courses,
          initial.filters?.course || "",
          false,
          "All courses",
        ) +
        select(
          "recipient_intake",
          "Intake",
          state.catalog.intakes,
          initial.filters?.intake || "",
          false,
          "All intakes",
        ) +
        select(
          "recipient_status",
          "Application status",
          state.catalog.statuses,
          initial.filters?.status || "",
          false,
          "All statuses",
        ) +
        field(
          "recipient_filter_search",
          "Search",
          initial.filters?.search || "",
          "text",
          false,
        ) +
        '</div><div id="all-recipient-warning" class="notice hidden">All eligible records of the selected type will be considered. You must review and confirm the exact recipient count before sending.</div><p class="form-help">Promotional messages require explicit consent. Recipients are deduplicated and frozen on the server before confirmation.</p><button class="btn primary" type="submit">Review recipients & send →</button></div>',
    ) +
    "</div></div></form>";
  bindEditor();
  const form = $("#compose-form");
  const message = () => {
    const data = Object.fromEntries(new FormData(form));
    let selection = { source: data.source, mode: data.recipient_mode };
    if (selection.mode === "selected") selection.ids = [...selectedIds];
    if (selection.mode === "filtered")
      selection.filters = {
        category: data.recipient_category,
        year: data.recipient_year,
        course: data.recipient_course,
        intake: data.recipient_intake,
        status: data.recipient_status,
        search: data.recipient_filter_search,
      };
    return {
      template_id: data.template_id || null,
      subject: data.subject,
      html: data.html,
      text: data.text,
      kind: data.kind,
      selection,
    };
  };
  const loadRecipients = async () => {
    const version = ++recipientPageVersion;
    const source = form.elements.source.value,
      query = form.elements.recipient_search.value;
    try {
      const data = await api(
        "/api/admin/email/recipients?source=" +
          source +
          "&limit=100&search=" +
          encodeURIComponent(query),
      );
      if (version !== recipientPageVersion) return;
      $("#recipient-options").innerHTML = data.rows.length
        ? data.rows
            .map(
              (r) =>
                '<div class="recipient-row"><label><input type="checkbox" data-recipient="' +
                r.id +
                '" ' +
                (selectedIds.has(r.id) ? "checked" : "") +
                "><span>" +
                h(r.full_name) +
                "<small>" +
                h(r.email) +
                (r.student_number
                  ? " · Student no. " + h(r.student_number)
                  : "") +
                "</small></span></label></div>",
            )
            .join("")
        : '<p class="muted">No matching recipients.</p>';
      $("#recipient-selected").textContent =
        selectedIds.size + " selected. Showing up to 100 matching records.";
      $("#recipient-options")
        .querySelectorAll("input")
        .forEach((box) =>
          box.addEventListener("change", () => {
            if (box.checked) selectedIds.add(box.dataset.recipient);
            else selectedIds.delete(box.dataset.recipient);
            $("#recipient-selected").textContent =
              selectedIds.size +
              " selected. Showing up to 100 matching records.";
          }),
        );
    } catch (e) {
      $("#recipient-options").textContent = e.message;
    }
  };
  const modeChanged = () => {
    const mode = form.elements.recipient_mode.value;
    $("#recipient-picker").classList.toggle("hidden", mode !== "selected");
    $("#recipient-filters").classList.toggle("hidden", mode !== "filtered");
    $("#all-recipient-warning").classList.toggle("hidden", mode !== "all");
    const students = form.elements.source.value === "students";
    form.elements.recipient_status.innerHTML = options(
      students
        ? ["Enrolled", "Completed", "Withdrawn"]
        : state.catalog.statuses,
      form.elements.recipient_status.value,
      "All statuses",
    );
    for (const name of [
      "recipient_course",
      "recipient_intake",
      "recipient_status",
    ])
      form.elements[name].closest("label").classList.toggle("hidden", false);
  };
  form.elements.recipient_mode.addEventListener("change", modeChanged);
  form.elements.source.addEventListener("change", () => {
    selectedIds.clear();
    modeChanged();
    loadRecipients();
  });
  let searchTimer;
  form.elements.recipient_search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadRecipients, 300);
  });
  form.elements.template_id.addEventListener("change", () => {
    const t = templates.find((t) => t.id === form.elements.template_id.value);
    if (t)
      for (const key of ["subject", "html", "text", "kind"])
        form.elements[key].value = t[key];
  });
  modeChanged();
  await loadRecipients();
  handlers["preview-compose"] = () => previewContent(message());
  handlers["save-draft"] = async () => {
    await api("/api/admin/email/drafts", { method: "POST", body: message() });
    toast("Draft saved.");
  };
  forms["prepare-email"] = async () => {
    const prepared = await api("/api/admin/email/prepare", {
      method: "POST",
      body: message(),
    });
    modal(
      "Confirm email recipients",
      "<p><strong>" +
        prepared.count +
        " recipient" +
        (prepared.count === 1 ? "" : "s") +
        '</strong> will receive individual personalized messages. This exact list is now frozen.</p><div class="recipient-list">' +
        prepared.recipients
          .map(
            (r) =>
              '<div class="recipient-row"><span>' +
              h(r.name) +
              "<small>" +
              h(r.email) +
              " · " +
              h(r.contactRecipient || "student") +
              (r.studentNumber ? " · Student no. " + h(r.studentNumber) : "") +
              "</small></span></div>",
          )
          .join("") +
        "</div>" +
        (prepared.excluded.length
          ? '<div class="notice info"><span>' +
            prepared.excluded.length +
            " records excluded.</span></div><ul>" +
            prepared.excluded
              .map((r) => "<li>" + h(r.name) + ": " + h(r.reason) + "</li>")
              .join("") +
            "</ul>"
          : "") +
        '<label class="check-label"><input id="confirm-send" type="checkbox"><span>I confirm sending this message to these ' +
        prepared.count +
        ' recipients.</span></label><p id="send-error" class="form-error" role="alert"></p>',
      '<div class="modal-actions">' +
        button("close-modal", "Cancel") +
        button("queue-message", "Confirm & queue", "primary", "send") +
        "</div>",
    );
    handlers["queue-message"] = async (_, button) => {
      if (!$("#confirm-send").checked) {
        $("#send-error").textContent =
          "Confirm the recipient list before sending.";
        return;
      }
      button.disabled = true;
      try {
        await api("/api/admin/email/campaigns/" + prepared.id + "/queue", {
          method: "POST",
          body: {
            confirmed: true,
            confirmationToken: prepared.confirmationToken,
          },
        });
        $("#modal").close();
        toast(
          "Messages queued. SMTP acceptance and failures appear in Email Center.",
        );
        go("email/message/" + prepared.id);
      } catch (e) {
        $("#send-error").textContent = e.message;
        button.disabled = false;
      }
    };
  };
}

async function settingsPage(params) {
  const data = await api("/api/admin/settings");
  const tab = params.get("tab") || "institute";
  $("#main").innerHTML =
    heading(
      "ADMINISTRATION",
      "Settings",
      "Manage institute details, staff access, and email configuration.",
    ) +
    '<div class="tabs">' +
    [
      ["institute", "Institute"],
      ["smtp", "SMTP email"],
      ["users", "Staff & permissions"],
      ["catalog", "Courses & intakes"],
    ]
      .map(
        ([key, label]) =>
          '<a class="tab ' +
          (key === tab ? "active" : "") +
          '" href="#settings?tab=' +
          key +
          '">' +
          label +
          "</a>",
      )
      .join("") +
    '</div><div class="settings-layout" id="settings-content"></div>';
  const target = $("#settings-content");
  if (tab === "smtp") {
    const c = data.smtp;
    target.innerHTML = panel(
      "SMTP configuration",
      '<div class="panel-body"><div class="actions">' +
        badge(c.configured ? "Configured" : "Not configured") +
        badge(
          c.sendingEnabled ? "Live sending enabled" : "Live sending disabled",
        ) +
        '</div><p class="settings-note">Credentials stay encrypted on the server. TLS certificate validation is required. A blank password preserves the saved secret. Configure SMTP_ENCRYPTION_KEY before saving the initial password.</p><form data-handler="save-smtp"><div class="form-grid">' +
        field("host", "SMTP host", c.host || "") +
        field("port", "Port", c.port || 587, "number") +
        select(
          "encryption",
          "Encryption",
          [
            { id: "STARTTLS", name: "STARTTLS (usually 587)" },
            { id: "TLS", name: "TLS (usually 465)" },
          ],
          c.encryption || "STARTTLS",
        ) +
        field("username", "SMTP username", c.username || "") +
        field(
          "password",
          c.passwordSaved
            ? "Password (saved — leave blank to keep)"
            : "SMTP password",
          "",
          "password",
          !c.passwordSaved,
        ) +
        field("senderName", "Sender name", c.senderName || "Tomoni") +
        field("senderEmail", "Sender email", c.senderEmail || "", "email") +
        field(
          "replyTo",
          "Reply-to email (optional)",
          c.replyTo || "",
          "email",
          false,
        ) +
        field(
          "testRecipient",
          "Default test recipient",
          c.testRecipient || "",
          "email",
          false,
        ) +
        '</div><p class="form-error" role="alert"></p><div class="actions"><button class="btn primary" type="submit">Save SMTP settings</button>' +
        button("test-connection", "Test connection") +
        button("send-smtp-test", "Send test email") +
        '</div></form><hr class="section-divider"><p class="settings-note">This application requires a Node host that allows outbound SMTP/TCP connections. Some serverless hosts block these connections. For such a host, run this backend on a compatible Node server or use a secure SMTP relay reachable from your host. An email API is not substituted.</p></div>',
    );
    forms["save-smtp"] = async (form, input) => {
      await api("/api/admin/settings/smtp", { method: "PUT", body: input });
      toast("SMTP settings saved securely.");
      render();
    };
    handlers["test-connection"] = async () => {
      const result = await api("/api/admin/settings/smtp/test-connection", {
        method: "POST",
        body: {},
      });
      toast(result.message);
    };
    handlers["send-smtp-test"] = () => {
      testEmailDialog();
      const recipient = $('#modal input[name="recipient"]');
      recipient.value = c.testRecipient || "";
    };
  } else if (tab === "users") {
    const users = (await api("/api/admin/users")).rows;
    target.innerHTML = panel(
      "Staff accounts",
      '<div class="table-wrap"><table><thead><tr><th>Account</th><th>Role</th><th>Permissions</th><th>Status</th><th></th></tr></thead><tbody>' +
        users
          .map((u) => {
            const p = JSON.parse(u.permissions);
            return (
              "<tr><td>" +
              h(u.name) +
              '<span class="secondary">' +
              h(u.email) +
              "</span></td><td>" +
              badge(u.role) +
              "</td><td>" +
              (u.role === "Administrator"
                ? "All permissions"
                : Object.keys(p)
                    .filter((k) => p[k])
                    .map(h)
                    .join(", ") || "No permissions") +
              "</td><td>" +
              badge(u.active ? "Active" : "Inactive") +
              '</td><td><button class="btn small" data-action="edit-user" data-id="' +
              u.id +
              '">Manage</button></td></tr>'
            );
          })
          .join("") +
        "</tbody></table></div>",
      button("new-user", "Add account", "primary small", "plus"),
    );
    handlers["new-user"] = () => userDialog();
    handlers["edit-user"] = (_, button) =>
      userDialog(users.find((u) => u.id === button.dataset.id));
  } else if (tab === "catalog") {
    target.innerHTML =
      '<div class="notice info"><span>Deactivate an option to stop new applicants selecting it. Existing records and relationships are preserved.</span></div>' +
      [
        ["courses", "Courses", data.courses],
        ["intakes", "Intakes", data.intakes],
      ]
        .map(([key, title, rows]) =>
          panel(
            title,
            '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Display name</th><th>Status</th><th></th></tr></thead><tbody>' +
              rows
                .map(
                  (r) =>
                    '<tr><td class="reference">' +
                    h(r.id) +
                    "</td><td>" +
                    h(r.name) +
                    "</td><td>" +
                    badge(r.active ? "Active" : "Inactive") +
                    '</td><td><button class="btn small" data-action="edit-catalog" data-type="' +
                    key +
                    '" data-id="' +
                    h(r.id) +
                    '">Edit</button></td></tr>',
                )
                .join("") +
              "</tbody></table></div>",
            '<button class="btn small" data-action="new-catalog" data-type="' +
              key +
              '">' +
              icon("plus") +
              "Add option</button>",
          ),
        )
        .join("");
    ["courses", "intakes"].forEach((key, index) => {
      const section = target.querySelectorAll(".panel")[index];
      if (section) section.id = "catalog-" + key;
    });
    const focus = params.get("focus");
    if (focus === "courses" || focus === "intakes")
      document.getElementById("catalog-" + focus)?.scrollIntoView();
    handlers["new-catalog"] = (_, b) => catalogDialog(b.dataset.type);
    handlers["edit-catalog"] = (_, b) =>
      catalogDialog(
        b.dataset.type,
        data[b.dataset.type].find((r) => r.id === b.dataset.id),
      );
  } else {
    const c = data.institute;
    target.innerHTML = panel(
      "Institute information",
      '<div class="panel-body"><p class="settings-note">These details are used in public registration and email templates.</p><form data-handler="save-institute"><div class="form-grid">' +
        field("name", "Institute name", c.name) +
        field("email", "Contact email", c.email, "email", false) +
        field("phone", "Contact phone", c.phone, "tel", false) +
        field("timezone", "Timezone", c.timezone) +
        field(
          "logoUrl",
          "Logo image URL (HTTPS, optional)",
          c.logoUrl,
          "url",
          false,
        ) +
        textarea("address", "Contact address", c.address, 3) +
        textarea(
          "privacyText",
          "Public registration privacy notice",
          c.privacyText,
          5,
          true,
        ) +
        '</div><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save institute settings</button></form></div>',
    );
    forms["save-institute"] = async (form, input) => {
      await api("/api/admin/settings", {
        method: "PATCH",
        body: { institute: input },
      });
      state.catalog = await api("/api/admin/catalog");
      toast("Institute details saved.");
      render();
    };
  }
}
function userDialog(user = {}) {
  const p = user.permissions
    ? JSON.parse(user.permissions)
    : { records: true, email: false, export: false };
  modal(
    user.id ? "Manage staff account" : "Add staff account",
    '<form data-handler="save-user">' +
      (!user.id
        ? field("name", "Name") + field("email", "Email address", "", "email")
        : "<h3>" +
          h(user.name) +
          '</h3><p class="muted">' +
          h(user.email) +
          "</p>") +
      select("role", "Role", ["Administrator", "Staff"], user.role || "Staff") +
      field(
        "password",
        user.id
          ? "New password (optional, at least 12 characters)"
          : "Password (at least 12 characters)",
        "",
        "password",
        !user.id,
      ) +
      "<h3>Staff permissions</h3>" +
      check(
        "permission_records",
        "Manage registrations and students",
        p.records,
      ) +
      check(
        "permission_email",
        "Use email center and permitted email actions",
        p.email,
      ) +
      check("permission_export", "Export records to CSV", p.export) +
      (user.id ? check("active", "Account active", !!user.active) : "") +
      '<p class="form-help">Administrators have full access. Updating access or a password revokes existing sessions.</p><p class="form-error" role="alert"></p><button class="btn primary" type="submit">Save account</button></form>',
  );
  forms["save-user"] = async (form, input) => {
    input.permissions = {
      records: form.elements.permission_records.checked,
      email: form.elements.permission_email.checked,
      export: form.elements.permission_export.checked,
    };
    if (user.id) input.active = form.elements.active.checked;
    await api("/api/admin/users" + (user.id ? "/" + user.id : ""), {
      method: user.id ? "PATCH" : "POST",
      body: input,
    });
    $("#modal").close();
    toast("Account saved.");
    render();
  };
}
function catalogDialog(type, record = {}) {
  modal(
    record.id ? "Edit option" : "Add option",
    '<form data-handler="save-catalog">' +
      field("id", "Stable ID (letters, digits, hyphens)", record.id || "") +
      field("name", "Display name", record.name || "") +
      (type === "intakes"
        ? field("year", "Intake year", record.year || "", "number") +
          field("month", "Intake month (1–12)", record.month || "", "number")
        : "") +
      check("active", "Available for new applications", record.active !== 0) +
      '<p class="form-help">Stable IDs remain linked to existing applications. Deactivate an option instead of removing it.</p><p class="form-error" role="alert"></p><button type="submit" class="btn primary">Save option</button></form>',
  );
  if (record.id) $('#modal input[name="id"]').readOnly = true;
  forms["save-catalog"] = async (form, input) => {
    input.active = form.elements.active.checked;
    await api("/api/admin/settings/" + type, { method: "POST", body: input });
    state.catalog = await api("/api/admin/catalog");
    $("#modal").close();
    toast("Option saved.");
    render();
  };
}
function drawNav(route) {
  const links = [
    ["overview", "Overview", "layout-dashboard", "records"],
    ["registrations", "Registrations", "clipboard-list", "records"],
    ["students", "Students", "users", "records"],
    ["gallery", "Gallery", "images", "records"],
    ["email", "Email Center", "mail", "email"],
    ["templates", "Templates", "files", "email"],
    ["activity", "Activity Log", "history", null],
    ["courses", "Course management", "book-open", "admin"],
    ["intakes", "Intake management", "calendar-days", "admin"],
    ["settings", "Settings", "settings", "admin"],
  ];
  $("#nav").innerHTML = links
    .filter(([, label, ic, permission]) =>
      permission === "admin" ? isAdmin() : !permission || can(permission),
    )
    .map(
      ([key, label, ic]) =>
        '<a class="nav-item ' +
        (route === key ||
        (key === "registrations" && route === "registration") ||
        (key === "students" && route === "student")
          ? "active"
          : "") +
        '" href="#' +
        key +
        '">' +
        icon(ic) +
        label +
        "</a>",
    )
    .join("");
  $("#breadcrumb").textContent =
    links.find((l) => l[0] === route)?.[1] ||
    (route === "registration"
      ? "Applicant profile"
      : route === "student"
        ? "Student profile"
        : "Workspace");
}
async function render() {
  const version = ++routeVersion;
  handlers = {};
  forms = {};
  $("#sidebar").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
  if ($("#modal").open) $("#modal").close();
  const hash = location.hash.slice(1) || "overview",
    split = hash.split("?"),
    parts = split[0].split("/"),
    route = parts[0],
    params = new URLSearchParams(split[1]);
  drawNav(route);
  $("#main").innerHTML =
    '<div class="loading-state" role="status">Loading…</div>';
  try {
    if (
      [
        "overview",
        "registrations",
        "registration",
        "students",
        "student",
      ].includes(route) &&
      !can("records")
    )
      throw new Error("Your account does not have access to student records.");
    if (["email", "templates"].includes(route) && !can("email"))
      throw new Error("Your account does not have email permissions.");
    if (route === "settings" && !isAdmin())
      throw new Error("Settings are available to administrators.");
    if (route === "overview") await overviewPage();
    else if (route === "registrations") await recordsPage(params);
    else if (route === "students") await recordsPage(params, true);
    else if (route === "gallery") await galleryPage();
    else if (route === "registration") await profilePage(parts[1]);
    else if (route === "student") await profilePage(parts[1], true);
    else if (route === "activity") await activityPage(params);
    else if (route === "templates") await templatesPage(params);
    else if (route === "courses")
      await settingsPage(new URLSearchParams("tab=catalog&focus=courses"));
    else if (route === "intakes")
      await settingsPage(new URLSearchParams("tab=catalog&focus=intakes"));
    else if (route === "settings") await settingsPage(params);
    else if (route === "email" && parts[1] === "compose") await composerPage();
    else if (route === "email" && parts[1] === "message")
      await campaignPage(parts[2]);
    else if (route === "email") await emailPage(params);
    else throw new Error("Page not found.");
    if (version === routeVersion) icons();
  } catch (e) {
    if (version === routeVersion) {
      $("#main").innerHTML = heading(
        "WORKSPACE",
        "Unable to load this page",
        e instanceof TypeError
          ? "Check your connection and try again."
          : e.message,
        button("retry-page", "Try again"),
      );
      handlers["retry-page"] = render;
      icons();
    }
  }
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  event.preventDefault();
  const handler = handlers[button.dataset.action];
  if (handler)
    run(async () => {
      if (
        button.dataset.action === "queue-message" ||
        button.dataset.action === "confirm-action"
      )
        return handler(event, button);
      button.disabled = true;
      try {
        await handler(event, button);
      } finally {
        if (button.isConnected) button.disabled = false;
      }
    });
});
document.addEventListener("submit", async (event) => {
  const form = event.target.closest("form[data-handler]");
  if (!form) return;
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  if (submit?.disabled) return;
  if (!form.reportValidity()) return;
  const handler = forms[form.dataset.handler];
  if (!handler) return;
  const error = form.querySelector('.form-error[role="alert"]');
  if (error) error.textContent = "";
  form
    .querySelectorAll("input,select,textarea")
    .forEach((f) => f.removeAttribute("aria-invalid"));
  if (submit) submit.disabled = true;
  try {
    await handler(form, Object.fromEntries(new FormData(form)));
  } catch (e) {
    if (error)
      error.textContent =
        e instanceof TypeError
          ? "Unable to connect. Please try again."
          : e.message;
    else toast(e.message, true);
    for (const [key, message] of Object.entries(e.fields || {})) {
      const field = form.elements[key];
      if (field) {
        field.setAttribute("aria-invalid", "true");
        const target = form.querySelector("#err-" + key);
        if (target) target.textContent = message;
      }
    }
    form.querySelector('[aria-invalid="true"]')?.focus();
  } finally {
    if (submit?.isConnected) submit.disabled = false;
  }
});
$("#menu-toggle").addEventListener("click", () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", open);
});
$("#logout").addEventListener("click", () =>
  run(async () => {
    await api("/api/auth/logout", { method: "POST", body: {} });
    location.href = "/admin/login";
  }),
);
window.addEventListener("hashchange", render);
(async () => {
  try {
    state.me = await api("/api/auth/me");
    state.catalog = await api("/api/admin/catalog");
    $("#account-label").innerHTML =
      h(state.me.name) + "<small>" + h(state.me.role) + "</small>";
    if (!location.hash && !can("records"))
      location.hash = can("email") ? "email" : "activity";
    else await render();
  } catch (e) {
    if (!state.me) location.href = "/admin/login";
    else {
      $("#main").innerHTML = empty(
        "Unable to connect",
        "Refresh to try again.",
      );
      icons();
    }
  }
})();

function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}
$("#sidebar-close").addEventListener("click", closeSidebar);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSidebar();
});
