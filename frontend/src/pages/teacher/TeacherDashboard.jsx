// ============================================================
// Teacher Dashboard - assigned subjects + quick report export
// ============================================================
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [periodType, setPeriodType] = useState('weekly');

  useEffect(() => {
    api.get('/teacher/subjects').then((res) => setSubjects(res.data.data));
  }, []);

  function downloadReport(format) {
    const token = localStorage.getItem('token');
    const url = `/api/reports/attendance/export?format=${format}&period_type=${periodType}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `attendance_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        link.click();
      });
  }

  return (
    <DashboardLayout>
      <h2>Teacher Dashboard</h2>
      <p className="text-muted mb-16">Your assigned subjects and quick actions</p>

      <div className="card mb-16">
        <div className="flex-between">
          <h3>Export My Attendance Report</h3>
          <div className="flex gap-8">
            <select className="form-control" value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => downloadReport('pdf')}>Export PDF</button>
            <button className="btn btn-outline btn-sm" onClick={() => downloadReport('excel')}>Export Excel</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>My Subjects</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Code</th><th>Class</th><th>Department</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.class_name}</td>
                  <td>{s.department_name}</td>
                  <td>
                    <Link className="btn btn-primary btn-sm" to={`/teacher/mark-attendance?subject_id=${s.id}&class_id=${s.class_id}`}>
                      Mark Attendance
                    </Link>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan="5" className="text-muted">No subjects assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
