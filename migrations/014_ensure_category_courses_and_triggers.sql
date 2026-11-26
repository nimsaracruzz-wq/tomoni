-- Migration 014: Ensure all registration category courses and enrollment indexes exist

INSERT OR IGNORE INTO courses(id, name, active) VALUES ('visa', 'Japanese Visa + Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('general', 'General Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('jft', 'JFT-Basic Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('JFT', 'JFT-Basic Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('ol', 'O/L Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('al', 'A/L Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('kids', 'Kids Class', 1);

CREATE INDEX IF NOT EXISTS enrollments_student ON enrollments(student_id, confirmed_at);
CREATE INDEX IF NOT EXISTS enrollments_filters ON enrollments(category, enrollment_year, intake_id, status);

DROP TRIGGER IF EXISTS new_student_number_valid;
CREATE TRIGGER new_student_number_valid BEFORE INSERT ON students
WHEN NOT EXISTS(SELECT 1 FROM student_number_registry WHERE number=NEW.student_number AND scheme='legacy')
AND (
  typeof(NEW.student_number) <> 'text'
  OR NOT (
    (length(NEW.student_number) = 7 AND NOT NEW.student_number GLOB '*[^0-9]*')
    OR
    (length(NEW.student_number) = 9 AND NEW.student_number GLOB '[A-Z][A-Z][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
  )
)
BEGIN
  SELECT RAISE(ABORT, 'Student number must be either 7 numeric digits or 2 letters followed by 7 digits');
END;
