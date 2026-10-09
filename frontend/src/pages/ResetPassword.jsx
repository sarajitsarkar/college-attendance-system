// ============================================================
// Reset Password - opened via the link from the reset email
// Expects ?token=...&email=... in the URL query string
// ============================================================
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token || !email) {
      setError('This reset link is invalid. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔒</div>
        <div className="auth-title">Reset Password</div>
        <div className="auth-subtitle">{email ? `for ${email}` : 'Set a new password'}</div>

        {error && <div className="auth-error">{error}</div>}
        {success ? (
          <div className="auth-hint" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            ✅ Password reset successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-16" style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
