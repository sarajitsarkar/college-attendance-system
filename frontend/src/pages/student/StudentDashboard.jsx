// ============================================================
// Student Dashboard - overall % + subject-wise breakdown + notifications
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

function percentColor(pct) {
  if (pct >= 75) return 'var(--color-success)';
  if (pct >= 60) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export default function StudentDashboard() {
  const [overview, setOverview] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/student/overview').then((res) => setOverview(res.data.data));
    api.get('/student/notifications').then((res) => setNotifications(res.data.data));
  }, []);

  if (!overview) return <DashboardLayout><p>Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2>My Attendance Overview</h2>
      <p className="text-muted mb-16">Track your overall and subject-wise attendance</p>

      <div className="card mb-16">
        <div className="flex-between mb-16">
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: percentColor(overview.overallPercentage) }}>
              {overview.overallPercentage}%
            </div>
            <div className="text-muted">Overall Attendance ({overview.attendedClasses}/{overview.totalClasses} classes)</div>
          </div>
          {overview.isLow && (
            <div className="badge badge-danger" style={{ fontSize: 14, padding: '8px 16px' }}>
              ⚠️ Below 75% Required
            </div>
          )}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${overview.overallPercentage}%`, background: percentColor(overview.overallPercentage) }}
          />
        </div>
      </div>

      <div className="card mb-16">
        <h3>Subject-wise Attendance</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Code</th><th>Attended</th><th>Total</th><th>Percentage</th></tr></thead>
            <tbody>
              {overview.subjectWise.map((s) => (
                <tr key={s.subject_id}>
                  <td>{s.subject_name}</td>
                  <td>{s.code}</td>
                  <td>{s.attended || 0}</td>
                  <td>{s.total}</td>
                  <td>
                    <span className={`badge ${s.isLow ? 'badge-danger' : 'badge-success'}`}>{s.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>🔔 Notifications</h3>
        {notifications.length === 0 && <p className="text-muted">No notifications yet.</p>}
        {notifications.map((n) => (
          <div key={n.id} className="mb-16" style={{ borderLeft: '3px solid var(--color-warning)', paddingLeft: 12 }}>
            <strong>{n.title}</strong>
            <p className="text-muted" style={{ margin: '4px 0 0' }}>{n.message}</p>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
