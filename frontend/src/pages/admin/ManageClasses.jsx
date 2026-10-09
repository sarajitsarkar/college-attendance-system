// ============================================================
// Admin: Manage Classes (CRUD)
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const emptyForm = { name: '', department_id: '', year: '', section: '' };

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    const [classRes, depRes] = await Promise.all([
      api.get('/admin/classes'),
      api.get('/admin/departments'),
    ]);
    setClasses(classRes.data.data);
    setDepartments(depRes.data.data);
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(cls) {
    setForm({ name: cls.name, department_id: cls.department_id, year: cls.year, section: cls.section });
    setEditingId(cls.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/classes/${editingId}`, form);
    } else {
      await api.post('/admin/classes', form);
    }
    setShowForm(false);
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return;
    await api.delete(`/admin/classes/${id}`);
    loadData();
  }

  return (
    <DashboardLayout>
      <div className="flex-between mb-16">
        <h2>Manage Classes</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Class</button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3>{editingId ? 'Edit Class' : 'New Class'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Class Name</label>
                <input className="form-control" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CSE 3rd Year - A" />
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
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input type="number" className="form-control" required value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Section</label>
                <input className="form-control" required value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })} />
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
            <thead><tr><th>Name</th><th>Department</th><th>Year</th><th>Section</th><th>Actions</th></tr></thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.department_name}</td>
                  <td>{c.year}</td>
                  <td>{c.section}</td>
                  <td className="flex gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
