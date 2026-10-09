-- ============================================================
-- College Attendance Management System - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_attendance_db;
USE college_attendance_db;

-- ------------------------------------------------------------
-- USERS  (base auth table for Admin / Teacher / Student)
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,           -- bcrypt hash
  role          ENUM('admin','teacher','student') NOT NULL,
  phone         VARCHAR(20),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- DEPARTMENTS
-- ------------------------------------------------------------
CREATE TABLE departments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  code          VARCHAR(20) NOT NULL UNIQUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- CLASSES (e.g. "CSE - 3rd Year - Section A")
-- ------------------------------------------------------------
CREATE TABLE classes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  department_id INT NOT NULL,
  year          INT NOT NULL,
  section       VARCHAR(10) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- SUBJECTS
-- ------------------------------------------------------------
CREATE TABLE subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  code          VARCHAR(20) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  class_id      INT NOT NULL,
  teacher_id    INT NULL,                 -- assigned teacher (users.id where role=teacher)
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- STUDENTS (extends users)
-- ------------------------------------------------------------
CREATE TABLE students (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  roll_number     VARCHAR(30) NOT NULL UNIQUE,
  class_id        INT NOT NULL,
  department_id   INT NOT NULL,
  admission_year  INT,
  guardian_phone  VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- TEACHERS (extends users)
-- ------------------------------------------------------------
CREATE TABLE teachers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  employee_code   VARCHAR(30) NOT NULL UNIQUE,
  department_id   INT NOT NULL,
  designation     VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ATTENDANCE
-- One row per student, per subject, per date, per period
-- ------------------------------------------------------------
CREATE TABLE attendance (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  subject_id    INT NOT NULL,
  class_id      INT NOT NULL,
  teacher_id    INT NOT NULL,
  date          DATE NOT NULL,
  period        INT NOT NULL,             -- period 1,2,3...
  status        ENUM('present','absent','late') NOT NULL DEFAULT 'absent',
  remarks       VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, subject_id, date, period),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- NOTIFICATIONS (low-attendance alerts, etc.)
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  title         VARCHAR(150) NOT NULL,
  message       VARCHAR(500) NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Helpful indexes
-- ------------------------------------------------------------
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_subject ON attendance(subject_id);
CREATE INDEX idx_students_class ON students(class_id);
