// ============================================================
// Teacher Routes: /api/teacher (requires teacher role)
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect, authorize('teacher'));

router.get('/subjects', ctrl.getMySubjects);
router.get('/class-students', ctrl.getClassStudents);

router.post(
  '/attendance',
  [
    body('subject_id').isInt(),
    body('class_id').isInt(),
    body('date').isDate(),
    body('period').isInt(),
    body('records').isArray({ min: 1 }),
  ],
  validate,
  ctrl.markAttendance
);

router.get('/attendance', ctrl.getAttendanceForSession);
router.put('/attendance/:id', [body('status').isIn(['present', 'absent', 'late'])], validate, ctrl.updateAttendanceRecord);
router.delete('/attendance/:id', ctrl.deleteAttendanceRecord);

module.exports = router;
