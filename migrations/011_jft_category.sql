DROP TRIGGER IF EXISTS single_linked_registration;

CREATE TABLE IF NOT EXISTS enrollments_new(
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  application_id TEXT NOT NULL UNIQUE REFERENCES applications(id),
  category TEXT NOT NULL CHECK(category IN ('visa','ol','al','general','kids','jft')),
  course_id TEXT REFERENCES courses(id),
  intake_id TEXT REFERENCES intakes(id),
  enrollment_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Enrolled',
  confirmed_by TEXT REFERENCES users(id),
  confirmed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK((category='visa' AND intake_id IS NOT NULL) OR (category<>'visa' AND intake_id IS NULL))
);

INSERT OR IGNORE INTO enrollments_new SELECT * FROM enrollments;
DROP TABLE enrollments;
ALTER TABLE enrollments_new RENAME TO enrollments;
CREATE INDEX IF NOT EXISTS enrollments_filters ON enrollments(category,enrollment_year,intake_id,status);

CREATE TRIGGER single_linked_registration BEFORE INSERT ON applications WHEN NEW.existing_student_id IS NOT NULL AND (EXISTS(SELECT 1 FROM applications WHERE student_id=NEW.existing_student_id OR existing_student_id=NEW.existing_student_id) OR EXISTS(SELECT 1 FROM enrollments WHERE student_id=NEW.existing_student_id)) BEGIN SELECT RAISE(ABORT,'A student may have only one registration; edit the existing class'); END;
