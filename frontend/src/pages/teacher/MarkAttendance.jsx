// ============================================================
// Teacher: Mark Attendance by class / subject / date / period
// ============================================================
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const STATUS_OPTIONS = ['present', 'absent', 'late'];

export default function MarkAttendance() {
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { student_id: status }
  const [subjectId, setSubjectId] = useState(searchParams.get('subject_id') || '');
  const [classId, setClassId] = useState(searchParams.get('class_id') || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/teacher/subjects').then((res) => setSubjects(res.data.data));
  }, []);

  useEffect(() => {
    if (!classId) return;
    api.get('/teacher/class-students', { params: { class_id: classId } }).then((res) => {
      setStudents(res.data.data);
      // default everyone to "present"
      const initial = {};
      res.data.data.forEach((s) => { initial[s.student_id] = 'present'; });
      setAttendance(initial);
    });
  }, [classId]);

  function handleSubjectChange(id) {
    setSubjectId(id);
    const subject = subjects.find((s) => String(s.id) === String(id));
    if (subject) setClassId(subject.class_id);
  }

  function setStatus(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAll(status) {
    const updated = {};
    students.forEach((s) => { updated[s.student_id] = status; });
    setAttendance(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const records = students.map((s) => ({ student_id: s.student_id, status: attendance[s.student_id] || 'absent' }));
      await api.post('/teacher/attendance', { subject_id: subjectId, class_id: classId, date, period, records });
      setMessage('✅ Attendance saved successfully!');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to save attendance'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <h2>Mark Attendance</h2>
      <p className="text-muted mb-16">Select class, subject, date, and period, then mark each student</p>

      <div className="card mb-16">
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select className="form-control" value={subjectId} onChange={(e) => handleSubjectChange(e.target.value)}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ maxWidth: 160 }}>
          <label>Period</label>
          <input type="number" min="1" max="10" className="form-control" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
      </div>

      {message && <div className="card mb-16">{message}</div>}

      {students.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="card mb-16">
            <div className="flex-between mb-16">
              <h3>Students ({students.length})</h3>
              <div className="flex gap-8">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => markAll('present')}>Mark All Present</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => markAll('absent')}>Mark All Absent</button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Roll No.</th><th>Name</th><th>Status</th></tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_id}>
                      <td>{s.roll_number}</td>
                      <td>{s.name}</td>
                      <td>
                        <div className="flex gap-8">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => setStatus(s.student_id, opt)}
                              className={`btn btn-sm ${attendance[s.student_id] === opt ? `badge-${opt}` : 'btn-outline'}`}
                              style={attendance[s.student_id] === opt ? { fontWeight: 700 } : {}}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </form>
      )}
    </DashboardLayout>
  );
}
