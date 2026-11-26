import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const now = () => new Date().toISOString();
export const id = () => randomUUID();
export const hash = (value) =>
  createHash("sha256").update(String(value)).digest("hex");
export function passwordHash(password) {
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 256
  )
    throw new Error("Use a password between 12 and 256 characters.");
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function passwordMatches(password, stored) {
  try {
    const [salt, key] = stored.split(":");
    const a = scryptSync(String(password).slice(0, 256), salt, 64),
      b = Buffer.from(key, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
export const STATUSES = [
  "New",
  "Reviewing",
  "Contacted",
  "Accepted",
  "Enrolled",
  "Waitlisted",
  "Rejected",
  "Withdrawn",
];
export function openDatabase(filename) {
  if (filename !== ":memory:")
    mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;",
  );
  db.exec(readFileSync(path.join(ROOT, "migrations/001_initial.sql"), "utf8"));
  const store = {
    db,
    one: (sql, ...args) => db.prepare(sql).get(...args),
    all: (sql, ...args) => db.prepare(sql).all(...args),
    run: (sql, ...args) => db.prepare(sql).run(...args),
    tx(fn) {
      if (this.inTransaction) return fn();
      db.exec("BEGIN IMMEDIATE");
      this.inTransaction = true;
      this.commitCallbacks = [];
      try {
        const value = fn();
        db.exec("COMMIT");
        this.inTransaction = false;
        const callbacks = this.commitCallbacks;
        this.commitCallbacks = [];
        for (const callback of callbacks) callback();
        return value;
      } catch (e) {
        if (this.inTransaction) db.exec("ROLLBACK");
        this.commitCallbacks = [];
        throw e;
      } finally {
        this.inTransaction = false;
      }
    },
    afterCommit(fn) {
      if (this.inTransaction) this.commitCallbacks.push(fn);
      else fn();
    },
    setting(key, fallback = null) {
      const value = db
        .prepare("SELECT value FROM settings WHERE key=?")
        .get(key);
      return value ? JSON.parse(value.value) : fallback;
    },
    set(key, value) {
      db.prepare(
        "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      ).run(key, JSON.stringify(value));
    },
    audit(actor, action, type, recordId, details = {}) {
      db.prepare(
        "INSERT INTO audit_events(actor_id,actor_name,action,record_type,record_id,details,created_at) VALUES(?,?,?,?,?,?,?)",
      ).run(
        actor?.id || null,
        actor?.name || "Public applicant",
        action,
        type,
        recordId || null,
        JSON.stringify(details),
        now(),
      );
    },
  };
  store.tx(() => {
    if (!store.one("SELECT version FROM migrations WHERE version=?", "001")) {
      for (const level of ["N5", "N4", "N3", "N2", "N1"])
        store.run(
          "INSERT OR IGNORE INTO courses(id,name) VALUES(?,?)",
          level,
          level + " Japanese",
        );
      for (const [key, name] of [
        ["2027-04", "April 2027"],
        ["2027-06", "June 2027"],
        ["2027-10", "October 2027"],
      ])
        store.run(
          "INSERT OR IGNORE INTO intakes(id,name) VALUES(?,?)",
          key,
          name,
        );
      for (const [key, name] of [
        ["weekday-morning", "Weekday morning"],
        ["weekday-evening", "Weekday evening"],
        ["weekend", "Weekend"],
        ["flexible", "Flexible / Please contact me"],
      ])
        store.run(
          "INSERT OR IGNORE INTO schedules(id,name) VALUES(?,?)",
          key,
          name,
        );
      store.set("institute", {
        name: "TOMONI Japanese Language Institute",
        email: "tomoniinstitute@gmail.com",
        phone: "071 491 9354 / 070 270 7624",
        address: "No. 355 A 1/1 Hettipola Road, Kuliyapitiya",
        logoUrl: "",
        timezone: "Asia/Tokyo",
        privacyText:
          "Your details are used to review your application and contact you about studying at Tomoni. Promotional emails are optional. Contact the institute to request a correction or removal.",
      });
      const templates = [
        [
          "registration-received",
          "Registration received",
          "We received your application {{application_reference}}",
          "Thank you, {{first_name}}. We have received your application for {{course_name}} ({{intake}}). Your reference is {{application_reference}}. Our team will review your details and contact you.",
        ],
        [
          "additional-information",
          "Request for additional information",
          "More information about your application",
          "Hello {{first_name}}, please reply with the additional information requested by our admissions team. Application reference: {{application_reference}}.",
        ],
        [
          "application-accepted",
          "Application accepted",
          "Your application has been accepted",
          "Congratulations {{first_name}}. Your application for {{course_name}} has been accepted. Our team will contact you with the next steps.",
        ],
        [
          "enrollment-confirmed",
          "Enrollment confirmed",
          "Welcome to Tomoni",
          "Welcome {{first_name}}. Your enrollment is confirmed. Your student number is {{student_number}}. We look forward to seeing you in class.",
        ],
        [
          "general-announcement",
          "General announcement",
          "An update from {{institute_name}}",
          "Hello {{first_name}}, here is the latest update from {{institute_name}}.",
        ],
      ];
      for (const [key, name, subject, text] of templates)
        store.run(
          "INSERT OR IGNORE INTO templates(id,name,subject,html,text,kind,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
          key,
          name,
          subject,
          "<h1>" + name + "</h1><p>" + text + "</p>",
          text,
          "operational",
          now(),
          now(),
        );
      store.run(
        "INSERT INTO migrations(version,applied_at) VALUES(?,?)",
        "001",
        now(),
      );
    }
  });
  // Apply each additional schema migration once, atomically.
  for (const file of readdirSync(path.join(ROOT, "migrations"))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort()) {
    const version = file.split("_")[0];
    if (store.one("SELECT version FROM migrations WHERE version=?", version))
      continue;
    const sql = readFileSync(path.join(ROOT, "migrations", file), "utf8");
    const needsFkOff = /(?:^|\n)\s*DROP\s+TABLE\b/i.test(sql);
    if (needsFkOff) db.exec("PRAGMA foreign_keys=OFF;");
    try {
      store.tx(() => {
        db.exec(sql);
        store.run(
          "INSERT INTO migrations(version,applied_at) VALUES(?,?)",
          version,
          now(),
        );
      });
      if (needsFkOff) {
        const violations = db.prepare("PRAGMA foreign_key_check").all();
        if (violations.length)
          throw new Error("Foreign key check failed after migration " + file);
      }
    } finally {
      if (needsFkOff) db.exec("PRAGMA foreign_keys=ON;");
    }
  }
  store.run(
    "UPDATE email_recipients SET status='Failed',error='Sending was interrupted. Outcome is uncertain; verify with your SMTP provider before resending.' WHERE status='Sending'",
  );
  store.run(
    "UPDATE email_attempts SET status='Failed',finished_at=?,error='Interrupted; delivery outcome uncertain.' WHERE status='Sending'",
    now(),
  );
  store.run(
    "UPDATE campaigns SET status=CASE WHEN EXISTS(SELECT 1 FROM email_recipients r WHERE r.campaign_id=campaigns.id AND r.status='Failed') THEN 'Failed' ELSE 'Accepted by SMTP server' END WHERE status IN ('Sending','Queued') AND NOT EXISTS(SELECT 1 FROM email_recipients r WHERE r.campaign_id=campaigns.id AND r.status IN ('Sending','Queued'))",
  );
  return store;
}
export function importLegacy(store, directory) {
  let names;
  try {
    names = readdirSync(directory).filter((n) => n.endsWith(".json"));
  } catch {
    return 0;
  }
  let count = 0;
  store.tx(() => {
    for (const name of names) {
      let a;
      try {
        a = JSON.parse(readFileSync(path.join(directory, name), "utf8"));
      } catch {
        continue;
      }
      if (!a.id || store.one("SELECT id FROM applications WHERE id=?", a.id))
        continue;
      if (!a.name || !a.email) continue;
      const stamp = a.submittedAt || now();
      store.run(
        "INSERT INTO applications(id,reference,full_name,email,phone,country,course_id,intake_id,schedule_id,current_level,category,message,privacy_acknowledged,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        a.id,
        "LEGACY-" + a.id.slice(0, 8).toUpperCase(),
        a.name,
        a.email,
        a.phone || "",
        a.country || "",
        store.one("SELECT id FROM courses WHERE id=?", a.level)?.id || "N5",
        store.one("SELECT id FROM intakes WHERE id=?", a.intake)?.id || null,
        "flexible",
        a.level || "Beginner / No experience",
        a.category === "class-plus-visa" ? "class-plus-visa" : "class-only",
        a.notes || "",
        0,
        stamp,
        stamp,
      );
      store.run(
        "UPDATE applications SET registration_category=? WHERE id=?",
        a.category === "class-plus-visa" ? "visa" : "general",
        a.id,
      );
      store.run(
        "INSERT INTO status_history(id,application_id,to_status,created_at) VALUES(?,?,?,?)",
        id(),
        a.id,
        "New",
        stamp,
      );
      store.audit(null, "Imported legacy registration", "application", a.id);
      count++;
    }
  });
  return count;
}
