// ============================================================
// Admin Controller
// Manage: Departments, Classes, Subjects, Teachers, Students
// ============================================================
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/* ----------------------------- DEPARTMENTS ----------------------------- */

const getDepartments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM departments ORDER BY name');
  res.json({ success: true, data: rows });
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  const [result] = await pool.query('INSERT INTO departments (name, code) VALUES (?, ?)', [name, code]);
  res.status(201).json({ success: true, message: 'Department created', id: result.insertId });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  await pool.query('UPDATE departments SET name = ?, code = ? WHERE id = ?', [name, code, req.params.id]);
  res.json({ success: true, message: 'Department updated' });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Department deleted' });
});

/* -------------------------------- CLASSES -------------------------------- */

const getClasses = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, d.name AS department_name
     FROM classes c JOIN departments d ON c.department_id = d.id
     ORDER BY c.year, c.name`
  );
  res.json({ success: true, data: rows });
});

const createClass = asyncHandler(async (req, res) => {
  const { name, department_id, year, section } = req.body;
  const [result] = await pool.query(
    'INSERT INTO classes (name, department_id, year, section) VALUES (?, ?, ?, ?)',
    [name, department_id, year, section]
  );
  res.status(201).json({ success: true, message: 'Class created', id: result.insertId });
});

const updateClass = asyncHandler(async (req, res) => {
  const { name, department_id, year, section } = req.body;
  await pool.query('UPDATE classes SET name=?, department_id=?, year=?, section=? WHERE id=?', [
    name,
    department_id,
    year,
    section,
    req.params.id,
  ]);
  res.json({ success: true, message: 'Class updated' });
});

const deleteClass = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Class deleted' });
});

/* ------------------------------- SUBJECTS -------------------------------- */

const getSubjects = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, c.name AS class_name, d.name AS department_name, u.name AS teacher_name
     FROM subjects s
     JOIN classes c ON s.class_id = c.id
     JOIN departments d ON s.department_id = d.id
     LEFT JOIN users u ON s.teacher_id = u.id
     ORDER BY s.name`
  );
  res.json({ success: true, data: rows });
});

const createSubject = asyncHandler(async (req, res) => {
  const { name, code, department_id, class_id, teacher_id } = req.body;
  const [result] = await pool.query(
    'INSERT INTO subjects (name, code, department_id, class_id, teacher_id) VALUES (?, ?, ?, ?, ?)',
    [name, code, department_id, class_id, teacher_id || null]
  );
  res.status(201).json({ success: true, message: 'Subject created', id: result.insertId });
});

const updateSubject = asyncHandler(async (req, res) => {
  const { name, code, department_id, class_id, teacher_id } = req.body;
  await pool.query(
    'UPDATE subjects SET name=?, code=?, department_id=?, class_id=?, teacher_id=? WHERE id=?',
    [name, code, department_id, class_id, teacher_id || null, req.params.id]
  );
  res.json({ success: true, message: 'Subject updated' });
});

const deleteSubject = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Subject deleted' });
});

/* -------------------------------- TEACHERS -------------------------------- */

const getTeachers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let sql = `SELECT t.id AS teacher_id, u.id AS user_id, u.name, u.email, u.phone, u.is_active,
                    t.employee_code, t.designation, d.name AS department_name
             FROM teachers t
             JOIN users u ON t.user_id = u.id
             JOIN departments d ON t.department_id = d.id`;
  const params = [];
  if (search) {
    sql += ' WHERE u.name LIKE ? OR u.email LIKE ? OR t.employee_code LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY u.name';
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employee_code, department_id, designation } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password || 'Password@123', 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "teacher", ?)',
      [name, email, hash, phone]
    );
    const [teacherResult] = await conn.query(
      'INSERT INTO teachers (user_id, employee_code, department_id, designation) VALUES (?, ?, ?, ?)',
      [userResult.insertId, employee_code, department_id, designation]
    );
    await conn.commit();
    res.status(201).json({ success: true, message: 'Teacher created', id: teacherResult.insertId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

const updateTeacher = asyncHandler(async (req, res) => {
  const { name, phone, employee_code, department_id, designation, is_active } = req.body;
  const [trows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
  const teacher = trows[0];
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  await pool.query('UPDATE users SET name=?, phone=?, is_active=? WHERE id=?', [
    name,
    phone,
    is_active ?? 1,
    teacher.user_id,
  ]);
  await pool.query('UPDATE teachers SET employee_code=?, department_id=?, designation=? WHERE id=?', [
    employee_code,
    department_id,
    designation,
    req.params.id,
  ]);
  res.json({ success: true, message: 'Teacher updated' });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const [trows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
  if (!trows[0]) return res.status(404).json({ success: false, message: 'Teacher not found' });
  await pool.query('DELETE FROM users WHERE id = ?', [trows[0].user_id]); // cascades to teachers
  res.json({ success: true, message: 'Teacher deleted' });
});

/* -------------------------------- STUDENTS -------------------------------- */

const getStudents = asyncHandler(async (req, res) => {
  const { search, class_id, department_id } = req.query;
  let sql = `SELECT s.id AS student_id, u.id AS user_id, u.name, u.email, u.phone, u.is_active,
                    s.roll_number, s.admission_year, s.guardian_phone,
                    c.name AS class_name, d.name AS department_name, s.class_id, s.department_id
             FROM students s
             JOIN users u ON s.user_id = u.id
             JOIN classes c ON s.class_id = c.id
             JOIN departments d ON s.department_id = d.id
             WHERE 1=1`;
  const params = [];
  if (search) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR s.roll_number LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (class_id) {
    sql += ' AND s.class_id = ?';
    params.push(class_id);
  }
  if (department_id) {
    sql += ' AND s.department_id = ?';
    params.push(department_id);
  }
  sql += ' ORDER BY s.roll_number';
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, phone, roll_number, class_id, department_id, admission_year, guardian_phone } =
    req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password || 'Password@123', 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, "student", ?)',
      [name, email, hash, phone]
    );
    const [studentResult] = await conn.query(
      `INSERT INTO students (user_id, roll_number, class_id, department_id, admission_year, guardian_phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, roll_number, class_id, department_id, admission_year, guardian_phone]
    );
    await conn.commit();
    res.status(201).json({ success: true, message: 'Student created', id: studentResult.insertId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

const updateStudent = asyncHandler(async (req, res) => {
  const { name, phone, roll_number, class_id, department_id, admission_year, guardian_phone, is_active } = req.body;
  const [srows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
  const student = srows[0];
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  await pool.query('UPDATE users SET name=?, phone=?, is_active=? WHERE id=?', [
    name,
    phone,
    is_active ?? 1,
    student.user_id,
  ]);
  await pool.query(
    `UPDATE students SET roll_number=?, class_id=?, department_id=?, admission_year=?, guardian_phone=?
     WHERE id=?`,
    [roll_number, class_id, department_id, admission_year, guardian_phone, req.params.id]
  );
  res.json({ success: true, message: 'Student updated' });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const [srows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!srows[0]) return res.status(404).json({ success: false, message: 'Student not found' });
  await pool.query('DELETE FROM users WHERE id = ?', [srows[0].user_id]); // cascades to students
  res.json({ success: true, message: 'Student deleted' });
});

/* ------------------------------ DASHBOARD STATS ---------------------------- */

const getDashboardStats = asyncHandler(async (req, res) => {
  const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
  const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) AS totalTeachers FROM teachers');
  const [[{ totalDepartments }]] = await pool.query('SELECT COUNT(*) AS totalDepartments FROM departments');
  const [[{ totalSubjects }]] = await pool.query('SELECT COUNT(*) AS totalSubjects FROM subjects');
  const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) AS totalClasses FROM classes');
  const [[{ todayAttendanceMarked }]] = await pool.query(
    'SELECT COUNT(*) AS todayAttendanceMarked FROM attendance WHERE date = CURDATE()'
  );

  res.json({
    success: true,
    data: { totalStudents, totalTeachers, totalDepartments, totalSubjects, totalClasses, todayAttendanceMarked },
  });
});

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
};
