// ============================================================
// Shared layout: top navbar + role-based sidebar + content outlet
// ============================================================
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const NAV_ITEMS = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/teachers', label: 'Teachers' },
    { to: '/admin/departments', label: 'Departments' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/classes', label: 'Classes' },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', end: true },
    { to: '/teacher/mark-attendance', label: 'Mark Attendance' },
  ],
  student: [
    { to: '/student', label: 'Dashboard', end: true },
    { to: '/student/history', label: 'Attendance History' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = NAV_ITEMS[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="navbar">
        <button className="hamburger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">
          ☰
        </button>
        <div className="navbar-title">🎓 College Attendance System</div>
        <div className="navbar-user">
          <span className="user-badge">{user?.role?.toUpperCase()}</span>
          <span className="user-name">{user?.name}</span>
          <Link to="/about" className="btn btn-ghost">About</Link>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
