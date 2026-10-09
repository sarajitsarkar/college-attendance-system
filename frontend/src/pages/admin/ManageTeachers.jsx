// ============================================================
// Admin: Manage Teachers (CRUD + search)
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  employee_code: '', department_id: '', designation: '',
};

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadTeachers(q = '') {
    const { data } = await api.get('/admin/teachers', { params: { search: q } });
    setTeachers(data.data);
  }

  useEffect(() => {
    api.get('/admin/departments').then((res) => setDepartments(res.data.data));
    loadTeachers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadTeachers(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(t) {
    setForm({
      name: t.name, email: t.email, password: '', phone: t.phone || '',
      employee_code: t.employee_code, department_id: '', designation: t.designation || '',
    });
    setEditingId(t.teacher_id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/teachers/${editingId}`, form);
    } else {
      await api.post('/admin/teachers', form);
    }
    setShowForm(false);
    loadTeachers(search);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this teacher account?')) return;
    await api.delete(`/admin/teachers/${id}`);
    loadTeachers(search);
  }

  return (
    <DashboardLayout>
      <div className="flex-between mb-16">
        <h2>Manage Teachers</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Teacher</button>
      </div>

      <div className="card mb-16">
        <input
          className="form-control"
          placeholder="🔍 Search by name, email, or employee code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3>{editingId ? 'Edit Teacher' : 'New Teacher'}</h3>
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
                <label>Phone</label>
                <input className="form-control" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
                <label>Employee Code</label>
                <input className="form-control" required value={form.employee_code}
                  onChange={(e) => setForm({ ...form, employee_code: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select className="form-control" required value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input className="form-control" placeholder="e.g. Assistant Professor" value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })} />
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
              <tr><th>Emp. Code</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.teacher_id}>
                  <td>{t.employee_code}</td>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.department_name}</td>
                  <td>{t.designation}</td>
                  <td>{t.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                  <td className="flex gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.teacher_id)}>Delete</button>
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
