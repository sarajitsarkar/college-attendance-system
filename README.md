# 🎓 College Attendance Management System

A full-stack web application for managing student attendance, built with **React**, **Node.js/Express**, and **MySQL**.

## Features

- 🔐 JWT-based authentication with **Admin / Teacher / Student** roles and role-based access control (RBAC)
- 🧑‍💼 **Admin dashboard**: manage students, teachers, departments, subjects, classes
- 👩‍🏫 **Teacher dashboard**: mark attendance by class/subject/date/period, edit/delete records
- 👨‍🎓 **Student dashboard**: overall & subject-wise attendance %, history, low-attendance alerts
- 📊 Automatic attendance percentage calculation
- 🔍 Search & filter students/teachers
- 📅 Daily / weekly / monthly attendance reports
- 📄 Export reports to **PDF** and **Excel**
- 🔔 Notifications for students below 75% attendance
- 📱 Fully responsive, modern UI
- ✅ RESTful API with input validation (`express-validator`) and centralized error handling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios, plain CSS |
| Backend | Node.js, Express |
| Database | MySQL 8 (`mysql2` driver) |
| Auth | JWT + bcrypt |
| Exports | `pdfkit` (PDF), `exceljs` (Excel) |

---

## Folder Structure

```
college-attendance-system/
├── database/
│   ├── schema.sql          # Table definitions
│   └── seed.sql            # Sample data
├── backend/
│   ├── config/db.js        # MySQL connection pool
│   ├── controllers/        # Business logic per module
│   ├── middleware/         # auth, validation, error handling
│   ├── routes/             # Express routers
│   ├── utils/              # PDF/Excel export, attendance calc, seed script
│   ├── app.js               # Express app config
│   ├── server.js            # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/     # Layout, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── admin/ teacher/ student/
│   │   │   └── Login.jsx
│   │   └── styles/
│   └── vite.config.js
├── API_DOCUMENTATION.md
└── README.md
```

---

## Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB 10.5+)

---

## Setup Instructions

### 1. Clone / unzip the project and set up the database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

This creates the `college_attendance_db` database with all tables and sample data
(1 admin, 2 teachers, 5 students, 3 departments, 3 classes, 4 subjects, sample attendance).

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_attendance_db
JWT_SECRET=some_long_random_string
```

Seed users have placeholder password hashes — run this once to set all
sample accounts' password to `Password@123`:
```bash
npm run seed
```

Start the API server:
```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```
API will run at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 3. Frontend setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` and proxies `/api` calls to the backend automatically (see `vite.config.js`).

### 4. Log in

Go to `http://localhost:5173/login` and use any of the sample accounts (password `Password@123`):

| Role | Email |
|---|---|
| Admin | admin@college.edu |
| Teacher | rajesh.kumar@college.edu |
| Teacher | anita.sharma@college.edu |
| Student | aditya.rao@college.edu |
| Student | priya.singh@college.edu |

---

## Building for Production

**Backend:** deploy `backend/` as-is to any Node host (Render, Railway, EC2, etc.), pointing `.env` at a production MySQL instance.

**Frontend:**
```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist/` — deploy to any static host (Netlify, Vercel, S3) and set the API base URL (update `vite.config.js` proxy or add an `axios` `baseURL` env var pointing at your deployed backend).

---

## Key Design Notes

- **Attendance uniqueness**: one record per `(student, subject, date, period)`, enforced by a DB unique key. Re-marking the same session **updates** existing rows (upsert via `ON DUPLICATE KEY UPDATE`).
- **Attendance %**: `present` and `late` both count as "attended"; only `absent` reduces the percentage. Threshold for "low attendance" defaults to 75% and is configurable via `LOW_ATTENDANCE_THRESHOLD` in `.env`.
- **RBAC**: enforced both by frontend route guards (`ProtectedRoute`) and backend middleware (`protect` + `authorize`) — never trust the frontend alone.
- **Reports**: `/api/reports/attendance` supports `period_type=daily|weekly|monthly` or an explicit `from`/`to` range, plus `class_id`/`subject_id` filters. The same filters apply to the PDF/Excel export endpoint.

## Troubleshooting

- **"MySQL connection failed"** — verify `.env` credentials and that MySQL is running (`mysql.server start` / `sudo service mysql start`).
- **Login fails for seeded users** — make sure you ran `npm run seed` in `backend/` after importing `seed.sql` (the raw SQL file uses placeholder password hashes).
- **CORS errors** — ensure `CLIENT_URL` in backend `.env` matches your frontend origin, or use the Vite dev proxy (default setup already handles this in development).

---

## License

This project is provided as a educational/demo template — feel free to adapt it for your institution.
