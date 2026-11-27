import { DatabaseSync } from "node:sqlite";
import { existsSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED_TABLES = [
  "applications",
  "students",
  "application_tags",
  "submission_keys",
  "notes",
  "status_history",
  "approval_notifications",
  "enrollment_notifications",
  "enrollment_history",
  "enrollments",
  "student_number_review",
  "student_number_registry",
  "registration_email_claims",
  "duplicate_registration_review",
  "email_recipients",
  "email_attempts",
  "audit_events",
  "campaigns",
];
const PURGE_SQL = [
  `DELETE FROM email_attempts
   WHERE recipient_id IN (
     SELECT id FROM email_recipients
     WHERE application_id IS NOT NULL OR student_id IS NOT NULL
   )`,
  `DELETE FROM audit_events
   WHERE record_id IN (
     SELECT id FROM applications
     UNION
     SELECT id FROM students
     UNION
     SELECT id FROM email_recipients
       WHERE application_id IS NOT NULL OR student_id IS NOT NULL
   )`,
  `DELETE FROM email_recipients
   WHERE application_id IS NOT NULL OR student_id IS NOT NULL`,
  "DELETE FROM application_tags",
  "DELETE FROM submission_keys",
  "DELETE FROM status_history",
  "DELETE FROM approval_notifications",
  "DELETE FROM enrollment_notifications",
  "DELETE FROM notes WHERE application_id IS NOT NULL OR student_id IS NOT NULL",
  "DELETE FROM enrollment_history",
  "DELETE FROM enrollments",
  "DELETE FROM student_number_review",
  "DELETE FROM student_number_registry",
  "DELETE FROM registration_email_claims",
  "DELETE FROM duplicate_registration_review",
  "DELETE FROM applications",
  "DELETE FROM students",
  "UPDATE campaigns SET selection='{}' WHERE selection <> '{}'",
];

function registrationFiles(dataDir) {
  const directory = path.join(dataDir, "registrations");
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .map((name) => path.join(directory, name));
}

function ensureSchema(db) {
  const available = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
  );
  const missing = REQUIRED_TABLES.filter((table) => !available.has(table));
  if (missing.length)
    throw new Error(
      "Database schema is missing required tables: " + missing.join(", "),
    );
}

function count(db, sql) {
  return db.prepare(sql).get().count;
}

function summary(db, legacyJsonFiles) {
  return {
    applications: count(db, "SELECT COUNT(*) AS count FROM applications"),
    students: count(db, "SELECT COUNT(*) AS count FROM students"),
    applicationTags: count(
      db,
      "SELECT COUNT(*) AS count FROM application_tags",
    ),
    submissionKeys: count(db, "SELECT COUNT(*) AS count FROM submission_keys"),
    notes: count(
      db,
      `SELECT COUNT(*) AS count FROM notes
       WHERE application_id IS NOT NULL OR student_id IS NOT NULL`,
    ),
    statusHistory: count(db, "SELECT COUNT(*) AS count FROM status_history"),
    approvalNotifications: count(
      db,
      "SELECT COUNT(*) AS count FROM approval_notifications",
    ),
    enrollmentNotifications: count(
      db,
      "SELECT COUNT(*) AS count FROM enrollment_notifications",
    ),
    enrollmentHistory: count(
      db,
      "SELECT COUNT(*) AS count FROM enrollment_history",
    ),
    enrollments: count(db, "SELECT COUNT(*) AS count FROM enrollments"),
    studentNumberReviews: count(
      db,
      "SELECT COUNT(*) AS count FROM student_number_review",
    ),
    studentNumberRegistry: count(
      db,
      "SELECT COUNT(*) AS count FROM student_number_registry",
    ),
    registrationEmailClaims: count(
      db,
      "SELECT COUNT(*) AS count FROM registration_email_claims",
    ),
    duplicateRegistrationReviews: count(
      db,
      "SELECT COUNT(*) AS count FROM duplicate_registration_review",
    ),
    emailRecipients: count(
      db,
      `SELECT COUNT(*) AS count FROM email_recipients
       WHERE application_id IS NOT NULL OR student_id IS NOT NULL`,
    ),
    emailAttempts: count(
      db,
      `SELECT COUNT(*) AS count FROM email_attempts
       WHERE recipient_id IN (
         SELECT id FROM email_recipients
         WHERE application_id IS NOT NULL OR student_id IS NOT NULL
       )`,
    ),
    auditEvents: count(
      db,
      `SELECT COUNT(*) AS count FROM audit_events
       WHERE record_id IN (
         SELECT id FROM applications
         UNION
         SELECT id FROM students
         UNION
         SELECT id FROM email_recipients
           WHERE application_id IS NOT NULL OR student_id IS NOT NULL
       )`,
    ),
    campaignSelections: count(
      db,
      "SELECT COUNT(*) AS count FROM campaigns WHERE selection <> '{}'",
    ),
    legacyJsonFiles,
  };
}

function purge(db) {
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const statement of PURGE_SQL) db.exec(statement);
    const violations = db.prepare("PRAGMA foreign_key_check").all();
    if (violations.length)
      throw new Error(
        "Foreign-key validation failed; the purge was rolled back.",
      );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function purgeRegistrationData({ dbPath, dataDir, apply = false }) {
  const resolvedDbPath = path.resolve(
    dbPath ||
      process.env.DB_PATH ||
      path.join(process.env.DATA_DIR || path.join(ROOT, "data"), "tomoni.sqlite"),
  );
  const resolvedDataDir = path.resolve(
    dataDir || process.env.DATA_DIR || path.dirname(resolvedDbPath),
  );
  if (resolvedDbPath === path.parse(resolvedDbPath).root)
    throw new Error("Refusing to use a filesystem root as the database path.");
  if (!existsSync(resolvedDbPath))
    throw new Error("Database file not found: " + resolvedDbPath);

  const files = registrationFiles(resolvedDataDir);
  const db = new DatabaseSync(resolvedDbPath);
  try {
    db.exec("PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    ensureSchema(db);
    const before = summary(db, files.length);
    if (apply) {
      purge(db);
      try {
        for (const file of files) unlinkSync(file);
      } catch (error) {
        throw new Error(
          "The database purge committed, but a legacy registration file could not be removed. Do not restart the app until it is removed: " +
            error.message,
        );
      }
    }
    return { before, applied: apply };
  } finally {
    db.close();
  }
}

function printUsage() {
  console.log(
    "Preview: node scripts/purge-registration-data.mjs\n" +
      "Purge:   node scripts/purge-registration-data.mjs --apply --confirm-all-registrations\n" +
      "Database path uses DB_PATH, or DATA_DIR/tomoni.sqlite.",
  );
}

function main() {
  const flags = new Set(process.argv.slice(2));
  if (flags.has("--help")) {
    printUsage();
    return;
  }
  for (const flag of flags)
    if (!["--apply", "--confirm-all-registrations"].includes(flag))
      throw new Error("Unknown option: " + flag);
  const apply = flags.has("--apply");
  if (apply && !flags.has("--confirm-all-registrations"))
    throw new Error(
      "Permanent deletion requires --confirm-all-registrations.",
    );
  if (!apply && flags.has("--confirm-all-registrations"))
    throw new Error("Use --confirm-all-registrations together with --apply.");

  const result = purgeRegistrationData({ apply });
  console.log(
    apply
      ? "Records below were permanently purged:"
      : "Dry run only. The following records would be permanently purged:",
  );
  for (const [name, value] of Object.entries(result.before))
    console.log("  " + name + ": " + value);
  if (apply)
    console.log(
      "Purge complete. Admin accounts, settings, courses, and templates were preserved.",
    );
  else
    console.log(
      "To execute, block new registrations and pause email processing, then run again with --apply --confirm-all-registrations.",
    );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error("Registration data purge failed: " + error.message);
    process.exitCode = 1;
  }
}
