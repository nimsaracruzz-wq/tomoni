UPDATE courses
SET active = CASE WHEN id IN ('N5', 'N4') THEN 1 ELSE 0 END
WHERE id IN ('N5', 'N4', 'N3', 'N2', 'N1');
