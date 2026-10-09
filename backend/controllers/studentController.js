// ============================================================
// Student Controller
// View attendance %, history, subject-wise reports, notifications
// ============================================================
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { calcPercentage, isLowAttendance } = require('../utils/attendanceCalc');

// helper: resolve students.id from logged-in user id
async function getStudentIdFromUser(userId) {
  const [rows] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return rows[0]?.id || null;
}

// GET /api/student/overview -> overall % + subject-wise %
const getOverview = asyncHandler(async (req, res) => {
  const studentId = await getStudentIdFromUser(req.user.id);
  if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

  // Overall
  const [[overall]] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) AS attended
     FROM attendance WHERE student_id = ?`,
    [studentId]
  );
  const overallPercentage = calcPercentage(overall.total, overall.attended || 0);

  // Subject-wise
  const [subjectRows] = await pool.query(
    `SELECT sub.id AS subject_id, sub.name AS subject_name, sub.code,
            COUNT(a.id) AS total,
            SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) AS attended
     FROM subjects sub
     LEFT JOIN attendance a ON a.subject_id = sub.id AND a.student_id = ?
     WHERE sub.class_id = (SELECT class_id FROM students WHERE id = ?)
     GROUP BY sub.id, sub.name, sub.code
     ORDER BY sub.name`,
    [studentId, studentId]
  );

  const subjectWise = subjectRows.map((s) => ({
    ...s,
    percentage: calcPercentage(s.total, s.attended || 0),
    isLow: isLowAttendance(calcPercentage(s.total, s.attended || 0)),
  }));

  res.json({
    success: true,
    data: {
      overallPercentage,
      totalClasses: overall.total,
      attendedClasses: overall.attended || 0,
      isLow: isLowAttendance(overallPercentage),
      subjectWise,
    },
  });
});

// GET /api/student/history?from=&to=&subject_id=  -> attendance history
const getHistory = asyncHandler(async (req, res) => {
  const studentId = await getStudentIdFromUser(req.user.id);
  if (!studentId) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const { from, to, subject_id } = req.query;
  let sql = `SELECT a.date, a.period, a.status, a.remarks, sub.name AS subject_name, sub.code
             FROM attendance a
             JOIN subjects sub ON a.subject_id = sub.id
             WHERE a.student_id = ?`;
  const params = [studentId];

  if (from) {
    sql += ' AND a.date >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND a.date <= ?';
    params.push(to);
  }
  if (subject_id) {
    sql += ' AND a.subject_id = ?';
    params.push(subject_id);
  }
  sql += ' ORDER BY a.date DESC, a.period';

  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
});

// GET /api/student/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

// PUT /api/student/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [
    req.params.id,
    req.user.id,
  ]);
  res.json({ success: true, message: 'Notification marked as read' });
});

module.exports = { getOverview, getHistory, getNotifications, markNotificationRead };
