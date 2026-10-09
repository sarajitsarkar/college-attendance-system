// ============================================================
// Report Routes: /api/reports (Admin + Teacher)
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'teacher'));

router.get('/attendance', ctrl.getAttendanceReport);
router.get('/attendance/export', ctrl.exportAttendanceReport);
router.get('/low-attendance', ctrl.getLowAttendanceStudents);
router.post('/low-attendance/notify', authorize('admin'), ctrl.notifyLowAttendanceStudents);

module.exports = router;
