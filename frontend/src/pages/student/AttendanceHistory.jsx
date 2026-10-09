// ============================================================
// Student: Attendance History with date range / subject filter
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subjectId, setSubjectId] = useState('');

  async function loadHistory() {
    const { data } = await api.get('/student/history', {
      params: { from: from || undefined, to: to || undefined, subject_id: subjectId || undefined },
    });
    setHistory(data.data);
  }

  useEffect(() => {
    api.get('/student/overview').then((res) =>
      setSubjects(res.data.data.subjectWise.map((s) => ({ id: s.subject_id, name: s.subject_name })))
    );
    loadHistory();
  }, []);

  useEffect(() => { loadHistory(); }, [from, to, subjectId]);

  return (
    <DashboardLayout>
      <h2>Attendance History</h2>
      <p className="text-muted mb-16">Filter by date range or subject</p>

      <div className="card mb-16">
        <div className="form-row">
          <div className="form-group">
            <label>From Date</label>
            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <select className="form-control" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Subject</th><th>Period</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.date}</td>
                  <td>{h.subject_name} ({h.code})</td>
                  <td>{h.period}</td>
                  <td><span className={`badge badge-${h.status}`}>{h.status}</span></td>
                  <td>{h.remarks || '—'}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan="5" className="text-muted">No attendance records found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
