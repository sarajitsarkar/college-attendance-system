// ============================================================
// Auth Routes: /api/auth
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { login, getMe, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email required'), body('password').notEmpty().withMessage('Password required')],
  validate,
  login
);

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  changePassword
);

// Forgot / reset password (public - no auth required)
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

module.exports = router;
