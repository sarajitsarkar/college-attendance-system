// ============================================================
// About page - developer info & social links
// EDIT THE "SOCIAL_LINKS" AND "DEVELOPER" OBJECTS BELOW WITH YOUR OWN INFO
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css';

// -------- ✏️ EDIT THESE VALUES WITH YOUR OWN DETAILS -------------
const DEVELOPER = {
  name: 'SARAJIT SARKAR',
  bio: 'Full-stack developer who built this College Attendance Management System.',
};

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: '📸', url: 'https://www.instagram.com/ims.sarkar?igsh=cWlsNjZvMzF5d3Z2' },
  { label: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/your-handle' },
  { label: 'GitHub', icon: '💻', url: 'https://github.com/your-handle' },
  { label: 'Email', icon: '✉️', url: 'sarajitsarkar60530@gmail.com' },
];
// -------------------------------------------------------------------

export default function About() {
  return (
    <div className="about-page">
      <div className="about-card">
        <div className="about-logo">🎓</div>
        <h2>College Attendance Management System</h2>
        <p className="text-muted">
          A full-stack app for managing student attendance — built with React, Node.js/Express, and MySQL.
        </p>

        <hr className="about-divider" />

        <h3>{DEVELOPER.name}</h3>
        <p className="text-muted">{DEVELOPER.bio}</p>

        <div className="social-links">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="social-icon">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>

        <div className="mt-16" style={{ textAlign: 'center' }}>
          <Link to="/login" className="btn btn-outline btn-sm">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
