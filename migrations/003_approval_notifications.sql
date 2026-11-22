ALTER TABLE applications ADD COLUMN reserved_student_number TEXT;
CREATE INDEX application_reserved_number ON applications(reserved_student_number);
CREATE TABLE approval_notifications (
  application_id TEXT PRIMARY KEY REFERENCES applications(id),
  campaign_id TEXT REFERENCES campaigns(id),
  actor_id TEXT REFERENCES users(id),
  error TEXT,
  created_at TEXT NOT NULL
);
UPDATE templates SET html = html || '<p>Your student number: <strong>{{student_id}}</strong></p>', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id='application-accepted' AND instr(html,'{{student_id}}')=0;
UPDATE templates SET text = text || char(10) || char(10) || 'Your student number: {{student_id}}', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id='application-accepted' AND instr(text,'{{student_id}}')=0;
