// ============================================================
// Admin: Manage Students (CRUD + search + filter by class)
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  roll_number: '', class_id: '', department_id: '', admission_year: '', guardian_phone: '',
};

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadStudents() {
    const { data } = await api.get('/admin/students', {
      params: { search: search || undefined, class_id: classFilter || undefined },
    });
    setStudents(data.data);
  }

  useEffect(() => {
    api.get('/admin/classes').then((res) => setClasses(res.data.data));
    api.get('/admin/departments').then((res) => setDepartments(res.data.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadStudents, 350);
    return () => clearTimeout(t);
  }, [search, classFilter]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(s) {
    setForm({
      name: s.name, email: s.email, password: '', phone: s.phone || '',
      roll_number: s.roll_number, class_id: s.class_id, department_id: s.department_id,
      admission_year: s.admission_year || '', guardian_phone: s.guardian_phone || '',
    });
    setEditingId(s.student_id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/students/${editingId}`, form);
    } else {
      await api.post('/admin/students', form);
    }
    setShowForm(false);
    loadStudents();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this student account?')) return;
    await api.delete(`/admin/students/${id}`);
    loadStudents();
  }

  return (
    <DashboardLayout>
      <div className="flex-between mb-16">
        <h2>Manage Students</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Student</button>
      </div>

      <div className="card mb-16">
        <div className="form-row">
          <input
            className="form-control"
            placeholder="🔍 Search by name, email, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-control" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">All classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3>{editingId ? 'Edit Student' : 'New Student'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" required disabled={!!editingId} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input className="form-control" required value={form.roll_number}
                  onChange={(e) => setForm({ ...form, roll_number: e.target.value })} />
              </div>
              {!editingId && (
                <div className="form-group">
                  <label>Initial Password</label>
                  <input className="form-control" placeholder="Default: Password@123" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select className="form-control" required value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select className="form-control" required value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Admission Year</label>
                <input type="number" className="form-control" value={form.admission_year}
                  onChange={(e) => setForm({ ...form, admission_year: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Guardian Phone</label>
                <input className="form-control" value={form.guardian_phone}
                  onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Roll No.</th><th>Name</th><th>Email</th><th>Class</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td>{s.roll_number}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.class_name}</td>
                  <td>{s.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                  <td className="flex gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.student_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
