// ============================================================
// Admin: Manage Subjects (CRUD) - assign teacher & class
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const emptyForm = { name: '', code: '', department_id: '', class_id: '', teacher_id: '' };

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    const [subRes, depRes, classRes, teacherRes] = await Promise.all([
      api.get('/admin/subjects'),
      api.get('/admin/departments'),
      api.get('/admin/classes'),
      api.get('/admin/teachers'),
    ]);
    setSubjects(subRes.data.data);
    setDepartments(depRes.data.data);
    setClasses(classRes.data.data);
    setTeachers(teacherRes.data.data);
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(sub) {
    setForm({
      name: sub.name, code: sub.code, department_id: sub.department_id,
      class_id: sub.class_id, teacher_id: sub.teacher_id || '',
    });
    setEditingId(sub.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/subjects/${editingId}`, form);
    } else {
      await api.post('/admin/subjects', form);
    }
    setShowForm(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this subject?')) return;
    await api.delete(`/admin/subjects/${id}`);
    loadData();
  }

  return (
    <DashboardLayout>
      <div className="flex-between mb-16">
        <h2>Manage Subjects</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Subject</button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3>{editingId ? 'Edit Subject' : 'New Subject'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Subject Name</label>
                <input className="form-control" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input className="form-control" required value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
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
            <div className="form-group">
              <label>Assigned Teacher</label>
              <select className="form-control" value={form.teacher_id}
                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">Unassigned</option>
                {teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
              </select>
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
            <thead><tr><th>Name</th><th>Code</th><th>Class</th><th>Teacher</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.class_name}</td>
                  <td>{s.teacher_name || <span className="text-muted">Unassigned</span>}</td>
                  <td className="flex gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
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
