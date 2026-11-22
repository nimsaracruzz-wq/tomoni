ALTER TABLE applications ADD COLUMN address_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN address_line2 TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN address_city TEXT NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN address_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN address_line2 TEXT NOT NULL DEFAULT '';
ALTER TABLE students ADD COLUMN address_city TEXT NOT NULL DEFAULT '';
UPDATE applications SET address_line1=home_address;
UPDATE students SET address_line1=home_address;
