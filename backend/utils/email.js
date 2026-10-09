// ============================================================
// Email utility - sends password reset emails via SMTP (nodemailer)
// Falls back to console logging if SMTP is not configured, so the
// forgot-password flow still works out of the box in local dev.
// ============================================================
const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends a password-reset email containing a link with the raw reset token.
 * If SMTP env vars are not set, logs the link to the server console instead
 * (useful for local development without a real mail account).
 */
async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!isEmailConfigured()) {
    console.log('\n📧 SMTP not configured — printing reset link instead of emailing it:');
    console.log(`   To: ${toEmail}`);
    console.log(`   Reset link: ${resetUrl}\n`);
    return { simulated: true };
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"College Attendance System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for the College Attendance System.</p>
        <p>
          <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;
             border-radius:8px;text-decoration:none;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#888;font-size:12px;">Link not working? Copy this into your browser:<br>${resetUrl}</p>
      </div>
    `,
  });

  return { simulated: false };
}

module.exports = { sendPasswordResetEmail, isEmailConfigured };
