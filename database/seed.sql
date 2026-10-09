-- ============================================================
-- Sample Data for College Attendance Management System
-- Passwords below are all bcrypt hashes of: "Password@123"
-- ============================================================
USE college_attendance_db;

-- Departments
INSERT INTO departments (name, code) VALUES
('Computer Science & Engineering', 'CSE'),
('Electronics & Communication', 'ECE'),
('Mechanical Engineering', 'MECH');

-- Classes
INSERT INTO classes (name, department_id, year, section) VALUES
('CSE 3rd Year - A', 1, 3, 'A'),
('CSE 2nd Year - B', 1, 2, 'B'),
('ECE 3rd Year - A', 2, 3, 'A');

-- Users: 1 Admin, 2 Teachers, 5 Students
-- password hash placeholder generated at runtime by /backend seed script (see README)
INSERT INTO users (name, email, password, role, phone) VALUES
('System Admin', 'admin@college.edu', '$2b$10$examplehashreplaceatruntime', 'admin', '9000000001'),
('Dr. Rajesh Kumar', 'rajesh.kumar@college.edu', '$2b$10$examplehashreplaceatruntime', 'teacher', '9000000002'),
('Prof. Anita Sharma', 'anita.sharma@college.edu', '$2b$10$examplehashreplaceatruntime', 'teacher', '9000000003'),
('Aditya Rao', 'aditya.rao@college.edu', '$2b$10$examplehashreplaceatruntime', 'student', '9000000004'),
('Priya Singh', 'priya.singh@college.edu', '$2b$10$examplehashreplaceatruntime', 'student', '9000000005'),
('Rohan Mehta', 'rohan.mehta@college.edu', '$2b$10$examplehashreplaceatruntime', 'student', '9000000006'),
('Sneha Iyer', 'sneha.iyer@college.edu', '$2b$10$examplehashreplaceatruntime', 'student', '9000000007'),
('Kabir Khan', 'kabir.khan@college.edu', '$2b$10$examplehashreplaceatruntime', 'student', '9000000008');

-- Teachers
INSERT INTO teachers (user_id, employee_code, department_id, designation) VALUES
(2, 'EMP001', 1, 'Associate Professor'),
(3, 'EMP002', 1, 'Assistant Professor');

-- Students
INSERT INTO students (user_id, roll_number, class_id, department_id, admission_year, guardian_phone) VALUES
(4, 'CSE21001', 1, 1, 2021, '9111111111'),
(5, 'CSE21002', 1, 1, 2021, '9111111112'),
(6, 'CSE21003', 1, 1, 2021, '9111111113'),
(7, 'CSE22001', 2, 1, 2022, '9111111114'),
(8, 'CSE22002', 2, 1, 2022, '9111111115');

-- Subjects
INSERT INTO subjects (name, code, department_id, class_id, teacher_id) VALUES
('Data Structures', 'CS301', 1, 1, 2),
('Database Management Systems', 'CS302', 1, 1, 3),
('Operating Systems', 'CS303', 1, 1, 2),
('Computer Networks', 'CS201', 1, 2, 3);

-- Sample attendance (last 5 days for subject 1 / class 1)
INSERT INTO attendance (student_id, subject_id, class_id, teacher_id, date, period, status) VALUES
(1, 1, 1, 2, CURDATE() - INTERVAL 4 DAY, 1, 'present'),
(2, 1, 1, 2, CURDATE() - INTERVAL 4 DAY, 1, 'present'),
(3, 1, 1, 2, CURDATE() - INTERVAL 4 DAY, 1, 'absent'),
(1, 1, 1, 2, CURDATE() - INTERVAL 3 DAY, 1, 'present'),
(2, 1, 1, 2, CURDATE() - INTERVAL 3 DAY, 1, 'absent'),
(3, 1, 1, 2, CURDATE() - INTERVAL 3 DAY, 1, 'present'),
(1, 1, 1, 2, CURDATE() - INTERVAL 2 DAY, 1, 'present'),
(2, 1, 1, 2, CURDATE() - INTERVAL 2 DAY, 1, 'present'),
(3, 1, 1, 2, CURDATE() - INTERVAL 2 DAY, 1, 'absent'),
(1, 1, 1, 2, CURDATE() - INTERVAL 1 DAY, 1, 'late'),
(2, 1, 1, 2, CURDATE() - INTERVAL 1 DAY, 1, 'present'),
(3, 1, 1, 2, CURDATE() - INTERVAL 1 DAY, 1, 'present');

-- NOTE: Run `npm run seed` in /backend to insert users with REAL bcrypt-hashed
-- passwords (all set to Password@123) instead of using this raw SQL for users.
