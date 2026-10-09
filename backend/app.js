// ============================================================
// Express app configuration (middleware + routes)
// ============================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ---- Global middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'College Attendance API is running', time: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/reports', reportRoutes);

// ---- 404 + error handler (keep last) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
