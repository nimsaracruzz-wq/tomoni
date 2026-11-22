import { fail } from "./validation.mjs";
import { contactEmail } from "./categories.mjs";
export function assertSingleRegistration(store, data, existing = null) {
  const addresses = [
    ["email", data.email],
    [
      (data.registration_category || data.category) === "kids" &&
      data.contact_recipient === "guardian"
        ? "guardian_email"
        : "email",
      contactEmail(data),
    ],
  ];
  for (const [field, value] of addresses) {
    if (!value) continue;
    const address = value.trim().toLowerCase(),
      claim = store.one(
        "SELECT * FROM registration_email_claims WHERE email=?",
        address,
      );
    if (
      existing &&
      (address === existing.email?.toLowerCase() ||
        address === contactEmail(existing)?.toLowerCase())
    )
      continue;
    if (
      claim &&
      !(
        existing &&
        (claim.application_id === existing.id ||
          (existing.student_id && claim.student_id === existing.student_id))
      )
    )
      fail(
        "This email address has already registered. A student can register for only one category and class. Contact Tomoni to change the existing registration.",
        409,
        { [field]: "This email has already been used for registration." },
      );
  }
  if (!existing) {
    if (
      data.existing_student_id &&
      (store.one(
        "SELECT id FROM applications WHERE student_id=? OR existing_student_id=?",
        data.existing_student_id,
        data.existing_student_id,
      ) ||
        store.one(
          "SELECT id FROM enrollments WHERE student_id=?",
          data.existing_student_id,
        ))
    )
      fail(
        "This student is already registered. Edit their existing category or class instead of creating another registration.",
        409,
      );
    const phone = data.phone || data.guardian_phone;
    if (
      phone &&
      store.one(
        "SELECT id FROM applications WHERE lower(trim(full_name))=lower(trim(?)) AND (phone=? OR (phone='' AND guardian_phone=?))",
        data.full_name,
        phone,
        phone,
      )
    )
      fail(
        "This student is already registered. Contact Tomoni to change the existing category or class.",
        409,
      );
  }
}
