UPDATE templates SET text='Thank you, {{first_name}}. We have received your application for {{course_name}}.
Registration category: {{registration_category}}
Intake: {{intake}}
Your application reference is {{application_reference}}. Our team will review your details and contact you.',html='<h1>Registration received</h1><p>Thank you, {{first_name}}. We have received your application for {{course_name}}.</p><p>Registration category: {{registration_category}}</p><p>Intake: {{intake}}</p><p>Your application reference is {{application_reference}}.</p>' WHERE id='registration-received' AND text LIKE 'Thank you, {{first_name}}. We have received your application for {{course_name}} ({{intake}}).%';
UPDATE templates SET text='Welcome {{full_name}}. Your enrollment is confirmed.
Student number: {{student_number}}
Registration category: {{registration_category}}
Course: {{course_name}}
Enrollment year: {{enrollment_year}}
Intake: {{intake}}',html='<h1>Enrollment confirmed</h1><p>Welcome {{full_name}}. Your enrollment is confirmed.</p><p>Student number: <strong>{{student_number}}</strong></p><p>Registration category: {{registration_category}}</p><p>Course: {{course_name}}</p><p>Enrollment year: {{enrollment_year}}</p><p>Intake: {{intake}}</p>' WHERE id='enrollment-confirmed' AND text='Welcome {{first_name}}. Your enrollment is confirmed. Your student ID is {{student_id}}. We look forward to seeing you in class.';
