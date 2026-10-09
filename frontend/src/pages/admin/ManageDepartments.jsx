// ============================================================
// Admin: Manage Departments (CRUD)
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const emptyForm = { name: '', code: '' };

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadDepartments() {
    const { data } = await api.get('/admin/departments');
    setDepartments(data.data);
  }

  useEffect(() => { loadDepartments(); }, []);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(dep) {
    setForm({ name: dep.name, code: dep.code });
    setEditingId(dep.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/departments/${editingId}`, form);
    } else {
      await api.post('/admin/departments', form);
    }
    setShowForm(false);
    loadDepartments();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this department? This may affect linked classes/subjects.')) return;
    await api.delete(`/admin/departments/${id}`);
    loadDepartments();
  }

  return (
    <DashboardLayout>
      <div className="flex-between mb-16">
        <h2>Manage Departments</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Department</button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <h3>{editingId ? 'Edit Department' : 'New Department'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Department Name</label>
                <input className="form-control" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input className="form-control" required value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })} />
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
            <thead><tr><th>Name</th><th>Code</th><th>Actions</th></tr></thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.code}</td>
                  <td className="flex gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
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
