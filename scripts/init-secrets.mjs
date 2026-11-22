import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { ROOT } from "../backend/db.mjs";
import path from "node:path";
const file = path.join(ROOT, ".env");
let existing = "";
try {
  existing = await readFile(file, "utf8");
} catch {}
if (/^SMTP_ENCRYPTION_KEY=.+/m.test(existing)) {
  console.log(
    "A server encryption key is already configured. Nothing changed.",
  );
} else {
  await writeFile(
    file,
    existing +
      "\nSMTP_ENCRYPTION_KEY=" +
      randomBytes(32).toString("base64") +
      "\nALLOW_EMAIL_SEND=false\n",
    { mode: 0o600 },
  );
  console.log(
    "A random encryption key was saved in .env. Live email sending remains disabled. Back up this secret securely; changing it makes saved SMTP passwords unreadable.",
  );
}
