-- Migration 013: Fix student number trigger for category-prefixed student IDs (e.g. JFT, General, O/L, A/L, Kids)

-- 1. Ensure active course rows exist for JFT
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('jft', 'JFT-Basic Class', 1);
INSERT OR IGNORE INTO courses(id, name, active) VALUES ('JFT', 'JFT-Basic Class', 1);

-- 2. Drop the obsolete trigger that strictly enforced 7 numeric digits
DROP TRIGGER IF EXISTS new_student_number_valid;

-- 3. Recreate trigger to allow both 7-digit visa IDs (e.g. 2704001) and 9-char category prefix IDs (e.g. JF2604001)
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

-- 4. Re-ensure single_linked_registration trigger is up to date
DROP TRIGGER IF EXISTS single_linked_registration;
CREATE TRIGGER single_linked_registration BEFORE INSERT ON applications WHEN NEW.existing_student_id IS NOT NULL AND (EXISTS(SELECT 1 FROM applications WHERE student_id=NEW.existing_student_id OR existing_student_id=NEW.existing_student_id) OR EXISTS(SELECT 1 FROM enrollments WHERE student_id=NEW.existing_student_id)) BEGIN SELECT RAISE(ABORT,'A student may have only one registration; edit the existing class'); END;
