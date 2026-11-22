import { DatabaseSync } from "node:sqlite";
import { transport, safeMailError } from "../backend/mail.mjs";
const db = new DatabaseSync(new URL("../data/tomoni.sqlite", import.meta.url));
const store = {
  setting(key, fallback) {
    const row = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
    return row ? JSON.parse(row.value) : fallback;
  },
};
const smtp = transport(store);
try {
  await smtp.verify();
  console.log(
    "Gmail SMTP connection and authentication verified. No email sent.",
  );
} catch (error) {
  console.error(safeMailError(error));
  process.exitCode = 1;
} finally {
  smtp.close();
  db.close();
}
