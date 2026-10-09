// ============================================================
// Student Routes: /api/student (requires student role)
// ============================================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

router.get('/overview', ctrl.getOverview);
router.get('/history', ctrl.getHistory);
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationRead);

module.exports = router;
