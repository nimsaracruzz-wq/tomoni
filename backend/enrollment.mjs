import { id, now } from "./db.mjs";
import { fail } from "./validation.mjs";
import { CATEGORIES } from "./categories.mjs";
export function instituteYear(store, date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: store.setting("institute").timezone,
    }).format(date),
  );
}
export function allocateNumber(
  store,
  category,
  year,
  intake,
) {
  const definition = CATEGORIES.find((c) => c.id === category);
  if (!definition)
    fail("Choose a valid registration category before enrollment.");
  if (!Number.isInteger(year) || year < 2000 || year > 2099)
    fail(
      "Student numbers support enrollment and intake years from 2000 through 2099.",
    );
  return store.tx(() => {
    let number;
    if (category === "visa") {
      if (
        !intake ||
        !Number.isInteger(intake.month) ||
        intake.month < 1 ||
        intake.month > 12 ||
        intake.year !== year
      )
        fail("Configure a valid visa intake year and month.");
      const prefix =
        String(year).slice(-2) + String(intake.month).padStart(2, "0");
      store.run(
        "INSERT OR IGNORE INTO visa_number_sequences(year,month,next_sequence) VALUES(?,?,1)",
        year,
        intake.month,
      );
      let sequence = store.one(
        "SELECT next_sequence FROM visa_number_sequences WHERE year=? AND month=?",
        year,
        intake.month,
      ).next_sequence;
      // Include preserved legacy numeric numbers and any previously allocated slot.
      const maximum =
        store.one(
          "SELECT MAX(CAST(substr(number,5,3) AS INTEGER)) n FROM student_number_registry WHERE length(number)=7 AND number NOT GLOB '*[^0-9]*' AND substr(number,1,4)=?",
          prefix,
        ).n || 0;
      sequence = Math.max(sequence, maximum + 1);
      if (sequence > 999)
        fail(
          "This visa intake has reached its capacity of 999 student numbers.",
          409,
        );
      number = prefix + String(sequence).padStart(3, "0");
      store.run(
        "UPDATE visa_number_sequences SET next_sequence=? WHERE year=? AND month=?",
        sequence + 1,
        year,
        intake.month,
      );
    } else {
      // Non-visa numbers use the category prefix plus the same YYMM### core
      // as visa numbers. They are sequential within each category and month.
      const month = 4;
      const core = String(year).slice(-2) + String(month).padStart(2, "0");
      const prefix = definition.code + core;
      const maximum =
        store.one(
          "SELECT MAX(CAST(substr(number,7,3) AS INTEGER)) n FROM student_number_registry WHERE length(number)=9 AND number GLOB ?",
          definition.code + core + "[0-9][0-9][0-9]",
        ).n || 0;
      if (maximum >= 999)
        fail(
          definition.name +
            " has reached its capacity of 999 student numbers for " +
            year +
            ".",
          409,
        );
      number = prefix + String(maximum + 1).padStart(3, "0");
    }
    if (!/^(?:\d{7}|[A-Z]{2}\d{7})$/.test(number))
      fail("Invalid generated student number.", 500);
    store.run(
      "INSERT INTO student_number_registry(number,scheme,assigned_at) VALUES(?,?,?)",
      number,
      "category-prefix-v2",
      now(),
    );
    return number;
  });
}
export function confirmEnrollment(store, application, actor) {
  return store.tx(() => {
    const prior = store.one(
      "SELECT * FROM enrollments WHERE application_id=?",
      application.id,
    );
    if (prior)
      return {
        student_id: prior.student_id,
        enrollment_year: prior.enrollment_year,
      };
    const category = application.registration_category || application.category;
    if (!CATEGORIES.some((c) => c.id === category))
      fail("Review the registration category before confirming enrollment.");
    const intake =
      category === "visa"
        ? store.one(
            "SELECT * FROM intakes WHERE id=? AND active=1",
            application.intake_id,
          )
        : null;
    if (category === "visa" && (!intake || !intake.year || !intake.month))
      fail("Choose an available visa intake with a configured year and month.");
    const year = instituteYear(store);
    const linked = application.existing_student_id || application.student_id;
    let existing = linked
      ? store.one("SELECT * FROM students WHERE id=?", linked)
      : null;
    if (linked && !existing) fail("The linked student could not be found.");
    if (!existing && application.email) {
      const matches = store.all(
        "SELECT * FROM students WHERE email=? AND lower(full_name)=lower(?) ORDER BY created_at LIMIT 2",
        application.email,
        application.full_name,
      );
      if (matches.length > 1)
        fail(
          "Several student identities match this contact. Link the correct existing student number before enrollment.",
          409,
        );
      existing = matches[0];
    }
    if (!existing && !application.email && application.guardian_email) {
      const matches = store.all(
        "SELECT * FROM students WHERE guardian_email=? AND lower(full_name)=lower(?) ORDER BY created_at LIMIT 2",
        application.guardian_email,
        application.full_name,
      );
      if (matches.length > 1)
        fail(
          "Several students match this guardian and name. Link the correct existing student number before enrollment.",
          409,
        );
      existing = matches[0];
    }
    if (!existing && application.reserved_student_number) {
      existing = store.one(
        "SELECT * FROM students WHERE student_number=?",
        application.reserved_student_number,
      );
      if (
        existing &&
        (existing.full_name.toLowerCase() !==
          application.full_name.toLowerCase() ||
          existing.email.toLowerCase() !== application.email.toLowerCase())
      )
        fail(
          "This legacy number belongs to another student. Review the linked identity before enrollment.",
          409,
        );
    }
    if (
      existing &&
      store.one(
        "SELECT id FROM enrollments WHERE student_id=? AND application_id<>?",
        existing.id,
        application.id,
      )
    )
      fail(
        "This student already has a registered class. Edit that registration instead of enrolling them twice.",
        409,
      );
    const studentId = existing?.id || id();
    const generationYear = category === "visa" ? intake.year : year;
    const number =
      existing?.student_number ||
      application.reserved_student_number ||
      allocateNumber(store, category, generationYear, intake);
    if (!existing) {
      const legacy = !!application.reserved_student_number;
      if (
        legacy &&
        !store.one(
          "SELECT number FROM student_number_registry WHERE number=?",
          number,
        )
      )
        fail("Review this legacy number reservation before enrollment.", 409);
      store.run(
        "INSERT INTO students(id,student_number,full_name,preferred_name,email,phone,country,promotional_consent,unsubscribed,created_at,original_category,original_year,original_intake_id,number_scheme,guardian_name,guardian_email,guardian_phone,contact_recipient,home_address,address_line1,address_line2,address_city) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        studentId,
        number,
        application.full_name,
        application.preferred_name,
        application.email,
        application.phone,
        application.country,
        application.promotional_consent,
        application.unsubscribed,
        now(),
        category,
        generationYear,
        category === "visa" ? intake.id : null,
        legacy ? "legacy" : "category-prefix-v2",
        application.guardian_name,
        application.guardian_email,
        application.guardian_phone,
        application.contact_recipient,
        application.home_address,
        application.address_line1,
        application.address_line2,
        application.address_city,
      );
      store.run(
        "UPDATE student_number_registry SET student_id=? WHERE number=?",
        studentId,
        number,
      );
    }
    if (existing)
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
        studentId,
      );
    const enrollmentId = id(),
      stamp = now();
    store.run(
      "INSERT INTO enrollments(id,student_id,application_id,category,course_id,intake_id,enrollment_year,confirmed_by,confirmed_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
      enrollmentId,
      studentId,
      application.id,
      category,
      application.course_id,
      category === "visa" ? intake.id : null,
      year,
      actor.id,
      stamp,
      stamp,
    );
    recordEnrollmentHistory(store, enrollmentId, actor);
    store.audit(actor, "Confirmed enrollment", "student", studentId, {
      application: application.reference,
      studentNumber: number,
      category,
      enrollmentYear: year,
      enrollmentId,
    });
    return { student_id: studentId, enrollment_year: year };
  });
}
export function recordEnrollmentHistory(store, enrollmentId, actor) {
  const e = store.one("SELECT * FROM enrollments WHERE id=?", enrollmentId);
  store.run(
    "INSERT INTO enrollment_history VALUES(?,?,?,?,?,?,?,?,?)",
    id(),
    e.id,
    e.category,
    e.course_id,
    e.intake_id,
    e.enrollment_year,
    e.status,
    actor.id,
    now(),
  );
}
export function reviseEnrollment(store, application, actor) {
  const e = store.one(
    "SELECT * FROM enrollments WHERE application_id=?",
    application.id,
  );
  if (!e) return;
  const category = application.registration_category;
  const intake = category === "visa" ? application.intake_id : null;
  if (
    e.category === category &&
    e.course_id === application.course_id &&
    e.intake_id === intake
  )
    return;
  if (
    category === "visa" &&
    !store.one("SELECT id FROM intakes WHERE id=?", intake)
  )
    fail("Choose a valid visa intake.");
  store.run(
    "UPDATE enrollments SET category=?,course_id=?,intake_id=?,updated_at=? WHERE id=?",
    category,
    application.course_id,
    intake,
    now(),
    e.id,
  );
  recordEnrollmentHistory(store, e.id, actor);
  store.audit(
    actor,
    "Updated enrollment; preserved student number",
    "student",
    e.student_id,
    { enrollmentId: e.id, category, course: application.course_id, intake },
  );
}
