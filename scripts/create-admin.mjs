import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import path from "node:path";
import { openDatabase, id, now, passwordHash, ROOT } from "../backend/db.mjs";
import { emailValid } from "../backend/validation.mjs";
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk);
    callback();
  },
});
const rl = createInterface({
  input: process.stdin,
  output,
  terminal: !!process.stdin.isTTY,
});
const store = openDatabase(
  process.env.DB_PATH ||
    path.join(process.env.DATA_DIR || path.join(ROOT, "data"), "tomoni.sqlite"),
);
const { values } = parseArgs({
  options: { name: { type: "string" }, email: { type: "string" } },
});
try {
  console.log(
    "Create an Administrator account. No default account or password is installed.",
  );
  const name = (values.name || (await rl.question("Full name: "))).trim();
  const email = (values.email || (await rl.question("Email address: ")))
    .trim()
    .toLowerCase();
  console.log("Account: " + name + " <" + email + ">");
  if (!name || !emailValid(email))
    throw new Error("A name and valid email are required.");
  if (store.one("SELECT id FROM users WHERE email=?", email))
    throw new Error(
      "This email already has an account. Manage it from Settings.",
    );
  process.stdout.write("Password (12+ characters, hidden): ");
  muted = true;
  const password = await rl.question("");
  muted = false;
  process.stdout.write("\nConfirm password (hidden): ");
  muted = true;
  const confirmation = await rl.question("");
  muted = false;
  process.stdout.write("\n");
  if (password !== confirmation) throw new Error("Passwords do not match.");
  const userId = id();
  store.run(
    "INSERT INTO users VALUES(?,?,?,?,?,?,?,?)",
    userId,
    name,
    email,
    passwordHash(password),
    "Administrator",
    "{}",
    1,
    now(),
  );
  store.audit(
    { id: userId, name },
    "Provisioned administrator account",
    "user",
    userId,
  );
  console.log("Administrator created. Sign in at /admin/login.");
} catch (error) {
  muted = false;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  store.db.close();
}
