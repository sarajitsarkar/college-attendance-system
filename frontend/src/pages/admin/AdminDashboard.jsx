// ============================================================
// Admin Dashboard - overview stats + low attendance alerts
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [lowAttendance, setLowAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, lowRes] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/reports/low-attendance'),
        ]);
        setStats(statsRes.data.data);
        setLowAttendance(lowRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function sendNotifications() {
    await api.post('/reports/low-attendance/notify');
    alert('Notifications sent to students with low attendance.');
  }

  if (loading) return <DashboardLayout><p>Loading dashboard...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2>Admin Dashboard</h2>
      <p className="text-muted mb-16">Overview of the college attendance system</p>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.totalStudents}</div><div className="stat-label">Total Students</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalTeachers}</div><div className="stat-label">Total Teachers</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalDepartments}</div><div className="stat-label">Departments</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalSubjects}</div><div className="stat-label">Subjects</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalClasses}</div><div className="stat-label">Classes</div></div>
        <div className="stat-card"><div className="stat-value">{stats.todayAttendanceMarked}</div><div className="stat-label">Records Marked Today</div></div>
      </div>

      <div className="card">
        <div className="flex-between mb-16">
          <h3>⚠️ Students Below 75% Attendance</h3>
          <button className="btn btn-primary btn-sm" onClick={sendNotifications}>
            Notify All
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Roll No.</th><th>Name</th><th>Class</th><th>Attendance %</th></tr>
            </thead>
            <tbody>
              {lowAttendance.length === 0 && (
                <tr><td colSpan="4" className="text-muted">No students below threshold 🎉</td></tr>
              )}
              {lowAttendance.map((s) => (
                <tr key={s.student_id}>
                  <td>{s.roll_number}</td>
                  <td>{s.name}</td>
                  <td>{s.class_name}</td>
                  <td><span className="badge badge-danger">{s.percentage}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
