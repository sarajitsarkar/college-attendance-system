// ============================================================
// Login page - shared by Admin / Teacher / Student
// ============================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>
        <div className="auth-title">College Attendance System</div>
        <div className="auth-subtitle">Sign in to continue</div>

        {error && <div className="auth-error">{error}</div>}

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
          <div className="form-group">
            <div className="flex-between">
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-hint">
          <strong>Demo accounts</strong> (password: <code>Password@123</code>):<br />
          Admin: admin@college.edu<br />
          Teacher: rajesh.kumar@college.edu<br />
          Student: aditya.rao@college.edu
        </div>

        <div className="mt-16" style={{ textAlign: 'center' }}>
          <Link to="/about" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            About this project
          </Link>
        </div>
      </div>
    </div>
  );
}
