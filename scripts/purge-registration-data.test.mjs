import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDatabase } from "../backend/db.mjs";
import { purgeRegistrationData } from "./purge-registration-data.mjs";

test("CLI requires explicit confirmation before applying a purge", () => {
  const scriptPath = fileURLToPath(
    new URL("./purge-registration-data.mjs", import.meta.url),
  );
  const result = spawnSync(
    process.execPath,
    [scriptPath, "--apply"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires --confirm-all-registrations/);
});

test("dry run preserves data; confirmed purge removes registration data only", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "tomoni-purge-"));
  const dataDir = path.join(directory, "data");
  const registrationsDir = path.join(dataDir, "registrations");
  const dbPath = path.join(dataDir, "tomoni.sqlite");
  mkdirSync(registrationsDir, { recursive: true });
  const legacyFile = path.join(registrationsDir, "legacy.json");
  writeFileSync(legacyFile, "{}");

  const store = openDatabase(dbPath);
  const stamp = new Date().toISOString();
  store.run(
    "INSERT INTO users VALUES(?,?,?,?,?,?,?,?)",
    "staff-1",
    "Admin",
    "admin@example.invalid",
    "password-hash",
    "Administrator",
    "{}",
    1,
    stamp,
  );
  store.set("preserved-setting", { enabled: true });
  store.run(
    "INSERT INTO student_number_registry(number,scheme,assigned_at) VALUES(?,?,?)",
    "1234567",
    "legacy",
    stamp,
  );
  store.run(
    "INSERT INTO students(id,student_number,full_name,email,phone,country,created_at) VALUES(?,?,?,?,?,?,?)",
    "student-1",
    "1234567",
    "Test Student",
    "student@example.invalid",
    "123",
    "JP",
    stamp,
  );
  store.run(
    `INSERT INTO applications
      (id,reference,full_name,email,phone,country,course_id,current_level,category,
       privacy_acknowledged,student_id,registration_category,created_at,updated_at)
     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    "application-1",
    "TEST-1",
    "Test Student",
    "student@example.invalid",
    "123",
    "JP",
    "N5",
    "Beginner",
    "class-only",
    1,
    "student-1",
    "general",
    stamp,
    stamp,
  );
  store.run(
    "INSERT INTO status_history(id,application_id,to_status,created_at) VALUES(?,?,?,?)",
    "status-1",
    "application-1",
    "Enrolled",
    stamp,
  );
  store.run("INSERT INTO tags(id,name) VALUES(?,?)", "tag-1", "test");
  store.run(
    "INSERT INTO application_tags(application_id,tag_id) VALUES(?,?)",
    "application-1",
    "tag-1",
  );
  store.run(
    "INSERT INTO submission_keys(key,fingerprint,application_id,created_at) VALUES(?,?,?,?)",
    "submission-1",
    "fingerprint-1",
    "application-1",
    stamp,
  );
  store.run(
    "INSERT INTO notes(id,application_id,student_id,body,created_at) VALUES(?,?,?,?,?)",
    "note-1",
    "application-1",
    "student-1",
    "Private note",
    stamp,
  );
  store.run(
    `INSERT INTO enrollments
      (id,student_id,application_id,category,course_id,enrollment_year,confirmed_at,updated_at)
     VALUES(?,?,?,?,?,?,?,?)`,
    "enrollment-1",
    "student-1",
    "application-1",
    "general",
    "N5",
    2026,
    stamp,
    stamp,
  );
  store.run(
    `INSERT INTO enrollment_history
      (id,enrollment_id,category,course_id,enrollment_year,status,created_at)
     VALUES(?,?,?,?,?,?,?)`,
    "enrollment-history-1",
    "enrollment-1",
    "general",
    "N5",
    2026,
    "Enrolled",
    stamp,
  );
  store.run(
    "INSERT INTO approval_notifications(application_id,created_at) VALUES(?,?)",
    "application-1",
    stamp,
  );
  store.run(
    "INSERT INTO enrollment_notifications(application_id,created_at) VALUES(?,?)",
    "application-1",
    stamp,
  );
  store.run(
    "INSERT INTO student_number_review(student_id,number,reason,created_at) VALUES(?,?,?,?)",
    "student-1",
    "1234567",
    "Test review",
    stamp,
  );
  store.run(
    "INSERT INTO duplicate_registration_review(email,reason,created_at) VALUES(?,?,?)",
    "student@example.invalid",
    "Test duplicate",
    stamp,
  );
  store.run(
    `INSERT INTO campaigns
      (id,subject,html,text,kind,confirmation_token,selection,created_at)
     VALUES(?,?,?,?,?,?,?,?)`,
    "campaign-1",
    "Welcome",
    "<p>Hello</p>",
    "Hello",
    "operational",
    "confirmation-1",
    JSON.stringify({
      mode: "selected",
      source: "applications",
      ids: ["application-1"],
    }),
    stamp,
  );
  store.run(
    `INSERT INTO email_recipients
      (id,campaign_id,application_id,student_id,email,full_name,subject,html,text)
     VALUES(?,?,?,?,?,?,?,?,?)`,
    "recipient-1",
    "campaign-1",
    "application-1",
    "student-1",
    "student@example.invalid",
    "Test Student",
    "Welcome",
    "<p>Hello Test Student</p>",
    "Hello Test Student",
  );
  store.run(
    "INSERT INTO email_attempts(id,recipient_id,started_at,status) VALUES(?,?,?,?)",
    "attempt-1",
    "recipient-1",
    stamp,
    "Failed",
  );
  store.run(
    `INSERT INTO audit_events(actor_name,action,record_type,record_id,created_at)
     VALUES(?,?,?,?,?)`,
    "Admin",
    "Confirmed enrollment",
    "student",
    "student-1",
    stamp,
  );
  store.db.close();

  try {
    const preview = purgeRegistrationData({ dbPath, dataDir });
    assert.equal(preview.applied, false);
    assert.equal(preview.before.applications, 1);
    assert.equal(preview.before.students, 1);
    assert.equal(existsSync(legacyFile), true);

    const applied = purgeRegistrationData({ dbPath, dataDir, apply: true });
    assert.equal(applied.applied, true);
    assert.equal(existsSync(legacyFile), false);

    const verify = openDatabase(dbPath);
    for (const table of [
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
    ])
      assert.equal(
        verify.one(`SELECT COUNT(*) AS count FROM ${table}`).count,
        0,
        table,
      );
    assert.equal(verify.one("SELECT COUNT(*) AS count FROM users").count, 1);
    assert.deepEqual(verify.setting("preserved-setting"), { enabled: true });
    assert.equal(
      verify.one("SELECT selection FROM campaigns WHERE id='campaign-1'").selection,
      "{}",
    );
    assert.deepEqual(verify.db.prepare("PRAGMA foreign_key_check").all(), []);
    verify.db.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
