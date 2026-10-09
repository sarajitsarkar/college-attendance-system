// ============================================================
// Reports Controller
// Daily/Weekly/Monthly reports, PDF/Excel export, low-attendance scan
// Accessible to Admin (all) and Teacher (their own subjects/classes)
// ============================================================
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { exportAttendanceToExcel } = require('../utils/exportExcel');
const { exportAttendanceToPDF } = require('../utils/exportPDF');
const { calcPercentage, isLowAttendance, LOW_ATTENDANCE_THRESHOLD } = require('../utils/attendanceCalc');

// Builds the base filtered query + params depending on role & query filters
function buildReportQuery(req) {
  const { class_id, subject_id, from, to, period_type } = req.query;

  let dateCondition = '';
  const params = [];

  if (from && to) {
    dateCondition = 'AND a.date BETWEEN ? AND ?';
    params.push(from, to);
  } else if (period_type === 'daily') {
    dateCondition = 'AND a.date = CURDATE()';
  } else if (period_type === 'weekly') {
    dateCondition = 'AND a.date >= (CURDATE() - INTERVAL 7 DAY)';
  } else if (period_type === 'monthly') {
    dateCondition = 'AND a.date >= (CURDATE() - INTERVAL 30 DAY)';
  }

  let sql = `SELECT a.id, a.date, a.period, a.status, a.remarks,
                    u.name AS student_name, s.roll_number,
                    sub.name AS subject_name, sub.code AS subject_code,
                    c.name AS class_name
             FROM attendance a
             JOIN students s ON a.student_id = s.id
             JOIN users u ON s.user_id = u.id
             JOIN subjects sub ON a.subject_id = sub.id
             JOIN classes c ON a.class_id = c.id
             WHERE 1=1 ${dateCondition}`;

  // Teachers can only see their own marked attendance
  if (req.user.role === 'teacher') {
    sql += ' AND a.teacher_id = ?';
    params.push(req.user.id);
  }

  if (class_id) {
    sql += ' AND a.class_id = ?';
    params.push(class_id);
  }
  if (subject_id) {
    sql += ' AND a.subject_id = ?';
    params.push(subject_id);
  }

  sql += ' ORDER BY a.date DESC, s.roll_number';
  return { sql, params };
}

// GET /api/reports/attendance -> JSON report (daily/weekly/monthly/custom range)
const getAttendanceReport = asyncHandler(async (req, res) => {
  const { sql, params } = buildReportQuery(req);
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/reports/attendance/export?format=pdf|excel
const exportAttendanceReport = asyncHandler(async (req, res) => {
  const { sql, params } = buildReportQuery(req);
  const [rows] = await pool.query(sql, params);
  const { format } = req.query;

  if (format === 'pdf') {
    return exportAttendanceToPDF(res, rows, 'Attendance_Report');
  }
  if (format === 'excel') {
    return exportAttendanceToExcel(res, rows, 'Attendance_Report');
  }
  return res.status(400).json({ success: false, message: 'format must be "pdf" or "excel"' });
});

// GET /api/reports/low-attendance -> list of students below threshold
const getLowAttendanceStudents = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id AS student_id, u.name, s.roll_number, c.name AS class_name,
            COUNT(a.id) AS total,
            SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) AS attended
     FROM students s
     JOIN users u ON s.user_id = u.id
     JOIN classes c ON s.class_id = c.id
     LEFT JOIN attendance a ON a.student_id = s.id
     GROUP BY s.id, u.name, s.roll_number, c.name`
  );

  const lowAttendance = rows
    .map((r) => ({ ...r, percentage: calcPercentage(r.total, r.attended || 0) }))
    .filter((r) => r.total > 0 && isLowAttendance(r.percentage));

  res.json({ success: true, threshold: LOW_ATTENDANCE_THRESHOLD, count: lowAttendance.length, data: lowAttendance });
});

// POST /api/reports/low-attendance/notify -> creates notification rows for low-attendance students
const notifyLowAttendanceStudents = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id AS student_id, s.user_id, u.name,
            COUNT(a.id) AS total,
            SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) AS attended
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN attendance a ON a.student_id = s.id
     GROUP BY s.id, s.user_id, u.name`
  );

  const lowStudents = rows
    .map((r) => ({ ...r, percentage: calcPercentage(r.total, r.attended || 0) }))
    .filter((r) => r.total > 0 && isLowAttendance(r.percentage));

  for (const student of lowStudents) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
      [
        student.user_id,
        'Low Attendance Warning',
        `Your attendance is ${student.percentage}%, which is below the required ${LOW_ATTENDANCE_THRESHOLD}%. Please attend classes regularly.`,
      ]
    );
  }

  res.json({ success: true, message: `Notified ${lowStudents.length} student(s) with low attendance` });
});

module.exports = {
  getAttendanceReport,
  exportAttendanceReport,
  getLowAttendanceStudents,
  notifyLowAttendanceStudents,
};
