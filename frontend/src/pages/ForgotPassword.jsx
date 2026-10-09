// ============================================================
// Forgot Password - request a reset link via email
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔑</div>
        <div className="auth-title">Forgot Password</div>
        <div className="auth-subtitle">Enter your email and we'll send you a reset link</div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-hint" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-16" style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
