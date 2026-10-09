// ============================================================
// App root - defines all routes with role-based protection
// ============================================================
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageClasses from './pages/admin/ManageClasses';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';

import StudentDashboard from './pages/student/StudentDashboard';
import AttendanceHistory from './pages/student/AttendanceHistory';

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={`/${user.role}`} replace /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><ManageTeachers /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><ManageDepartments /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><ManageSubjects /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />

      {/* Teacher routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/mark-attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/history" element={<ProtectedRoute allowedRoles={['student']}><AttendanceHistory /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/" element={<Navigate to={isAuthenticated ? `/${user.role}` : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
