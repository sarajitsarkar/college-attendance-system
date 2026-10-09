// ============================================================
// Authentication Controller: login, get current user, change password
// ============================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendPasswordResetEmail } = require('../utils/email');

const RESET_TOKEN_TTL_MINUTES = 30;

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];

  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Fetch role-specific profile id (student_id / teacher_id) for convenience
  let profile = null;
  if (user.role === 'student') {
    const [srows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
    profile = srows[0] || null;
  } else if (user.role === 'teacher') {
    const [trows] = await pool.query('SELECT * FROM teachers WHERE user_id = ?', [user.id]);
    profile = trows[0] || null;
  }

  const token = signToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile,
    },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: rows[0] });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHash, req.user.id]);

  res.json({ success: true, message: 'Password updated successfully' });
});

// POST /api/auth/forgot-password
// body: { email }
// Always responds with a generic success message, even if the email doesn't
// exist, so the endpoint can't be used to check which emails are registered.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];

  const genericResponse = {
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  };

  if (!user || !user.is_active) {
    return res.json(genericResponse); // don't reveal whether the email exists
  }

  // Generate a random raw token; store only its hash in the DB (never the raw token)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await pool.query('UPDATE users SET reset_token_hash = ?, reset_token_expires = ? WHERE id = ?', [
    tokenHash,
    expiresAt,
    user.id,
  ]);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  res.json(genericResponse);
});

// POST /api/auth/reset-password
// body: { email, token, newPassword }
const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, token, and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];

  if (!user || !user.reset_token_hash || !user.reset_token_expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
  }

  if (new Date(user.reset_token_expires) < new Date()) {
    return res.status(400).json({ success: false, message: 'This reset link has expired. Please request a new one.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (tokenHash !== user.reset_token_hash) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = ?',
    [newHash, user.id]
  );

  res.json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
});

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };
