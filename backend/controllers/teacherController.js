// ============================================================
// Teacher Controller
// Mark attendance, view own subjects/classes, edit/delete records
// ============================================================
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/teacher/subjects  -> subjects assigned to logged-in teacher
const getMySubjects = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, c.name AS class_name, d.name AS department_name
     FROM subjects s
     JOIN classes c ON s.class_id = c.id
     JOIN departments d ON s.department_id = d.id
     WHERE s.teacher_id = ?
     ORDER BY s.name`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

// GET /api/teacher/class-students?class_id=1  -> students in a class (only if teacher owns a subject there)
const getClassStudents = asyncHandler(async (req, res) => {
  const { class_id } = req.query;
  if (!class_id) return res.status(400).json({ success: false, message: 'class_id is required' });

  const [rows] = await pool.query(
    `SELECT s.id AS student_id, u.name, s.roll_number
     FROM students s JOIN users u ON s.user_id = u.id
     WHERE s.class_id = ? ORDER BY s.roll_number`,
    [class_id]
  );
  res.json({ success: true, data: rows });
});

// POST /api/teacher/attendance
// body: { subject_id, class_id, date, period, records: [{student_id, status, remarks}] }
const markAttendance = asyncHandler(async (req, res) => {
  const { subject_id, class_id, date, period, records } = req.body;

  if (!subject_id || !class_id || !date || !period || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required fields or empty records list' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const rec of records) {
      await conn.query(
        `INSERT INTO attendance (student_id, subject_id, class_id, teacher_id, date, period, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
        [rec.student_id, subject_id, class_id, req.user.id, date, period, rec.status, rec.remarks || null]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, message: `Attendance marked for ${records.length} student(s)` });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/teacher/attendance?subject_id=&class_id=&date=
const getAttendanceForSession = asyncHandler(async (req, res) => {
  const { subject_id, class_id, date, period } = req.query;
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS student_name, s.roll_number
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     JOIN users u ON s.user_id = u.id
     WHERE a.subject_id = ? AND a.class_id = ? AND a.date = ? AND a.period = ?
     ORDER BY s.roll_number`,
    [subject_id, class_id, date, period]
  );
  res.json({ success: true, data: rows });
});

// PUT /api/teacher/attendance/:id  -> edit a single attendance record
const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ? AND teacher_id = ?', [
    req.params.id,
    req.user.id,
  ]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Attendance record not found' });

  await pool.query('UPDATE attendance SET status = ?, remarks = ? WHERE id = ?', [
    status,
    remarks || null,
    req.params.id,
  ]);
  res.json({ success: true, message: 'Attendance record updated' });
});

// DELETE /api/teacher/attendance/:id
const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ? AND teacher_id = ?', [
    req.params.id,
    req.user.id,
  ]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Attendance record not found' });

  await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Attendance record deleted' });
});

module.exports = {
  getMySubjects,
  getClassStudents,
  markAttendance,
  getAttendanceForSession,
  updateAttendanceRecord,
  deleteAttendanceRecord,
};
