import { openDatabase, id, now, passwordHash } from "../backend/db.mjs";
import path from "node:path";

const dbPath = path.resolve("./data/tomoni.sqlite");
const store = openDatabase(dbPath);

const email = "admin@tomoni-japanese.edu";
const name = "Tomoni Administrator";
const password = "AdminPassword2026!";

const existing = store.one("SELECT * FROM users WHERE email=?", email);
if (!existing) {
  const userId = id();
  store.run(
    "INSERT INTO users(id, name, email, password_hash, role, permissions, active, created_at) VALUES(?,?,?,?,?,?,?,?)",
    userId,
    name,
    email,
    passwordHash(password),
    "Administrator",
    JSON.stringify({ records: true, email: true, export: true, settings: true }),
    1,
    now()
  );
  console.log(`Created administrator: ${email} with password: ${password}`);
} else {
  store.run(
    "UPDATE users SET password_hash=?, active=1 WHERE email=?",
    passwordHash(password),
    email
  );
  console.log(`Updated administrator: ${email} with password: ${password}`);
}

const allUsers = store.all("SELECT id, name, email, role, active FROM users");
console.log("All staff users:", allUsers);
