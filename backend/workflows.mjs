import { updateApplication } from "./records.mjs";
import { enrollmentEmail } from "./mail.mjs";
import { now } from "./db.mjs";
export function updateApplicationWithApproval(
  store,
  applicationId,
  input,
  actor,
  options,
) {
  return store.tx(() => {
    const result = updateApplication(store, applicationId, input, actor);
    if (["Accepted", "Enrolled"].includes(input.status))
      store.afterCommit(() => {
        if (
          store.one(
            "SELECT application_id FROM enrollment_notifications WHERE application_id=?",
            applicationId,
          )
        )
          return;
        try {
          store.tx(() => enrollmentEmail(store, applicationId, actor, options));
        } catch {
          store.run(
            "INSERT OR IGNORE INTO enrollment_notifications(application_id,actor_id,error,created_at) VALUES(?,?,?,?)",
            applicationId,
            actor.id,
            "Enrollment is saved, but the confirmation email could not be prepared. Review the recipient and template, then retry.",
            now(),
          );
          store.audit(
            actor,
            "Enrollment confirmation email preparation failed",
            "application",
            applicationId,
          );
        }
      });
    return result;
  });
}
