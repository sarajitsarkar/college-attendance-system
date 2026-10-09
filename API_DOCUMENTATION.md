# API Documentation — College Attendance Management System

Base URL: `http://localhost:5000/api`

All protected endpoints require an `Authorization: Bearer <token>` header. Obtain a token via `POST /auth/login`.

Response shape (consistent across the API):
```json
{ "success": true, "message": "...", "data": [...] }
```
Errors:
```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "Valid email required" } ] }
```

---

## Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Body: `{ email, password }` → returns `{ token, user }` |
| GET | `/auth/me` | Authenticated | Returns current user profile |
| PUT | `/auth/change-password` | Authenticated | Body: `{ currentPassword, newPassword }` |

---

## Admin (`/admin`) — requires role `admin`

### Dashboard
- `GET /admin/dashboard-stats` — counts of students, teachers, departments, subjects, classes, today's records

### Departments
- `GET /admin/departments`
- `POST /admin/departments` — `{ name, code }`
- `PUT /admin/departments/:id`
- `DELETE /admin/departments/:id`

### Classes
- `GET /admin/classes`
- `POST /admin/classes` — `{ name, department_id, year, section }`
- `PUT /admin/classes/:id`
- `DELETE /admin/classes/:id`

### Subjects
- `GET /admin/subjects`
- `POST /admin/subjects` — `{ name, code, department_id, class_id, teacher_id? }`
- `PUT /admin/subjects/:id`
- `DELETE /admin/subjects/:id`

### Teachers
- `GET /admin/teachers?search=` — search by name/email/employee code
- `POST /admin/teachers` — `{ name, email, password?, phone, employee_code, department_id, designation }`
- `PUT /admin/teachers/:id`
- `DELETE /admin/teachers/:id`

### Students
- `GET /admin/students?search=&class_id=&department_id=`
- `POST /admin/students` — `{ name, email, password?, phone, roll_number, class_id, department_id, admission_year, guardian_phone }`
- `PUT /admin/students/:id`
- `DELETE /admin/students/:id`

---

## Teacher (`/teacher`) — requires role `teacher`

- `GET /teacher/subjects` — subjects assigned to the logged-in teacher
- `GET /teacher/class-students?class_id=` — student roster for a class
- `POST /teacher/attendance` — mark attendance
  ```json
  {
    "subject_id": 1, "class_id": 1, "date": "2026-07-04", "period": 1,
    "records": [{ "student_id": 1, "status": "present", "remarks": "" }]
  }
  ```
  Uses upsert semantics — resubmitting the same date/period/subject/student updates the existing record.
- `GET /teacher/attendance?subject_id=&class_id=&date=&period=` — view a marked session
- `PUT /teacher/attendance/:id` — edit a single record `{ status, remarks }`
- `DELETE /teacher/attendance/:id` — delete a record

---

## Student (`/student`) — requires role `student`

- `GET /student/overview` — overall % + subject-wise % (auto-calculated)
- `GET /student/history?from=&to=&subject_id=` — attendance history log
- `GET /student/notifications` — low-attendance / system notifications
- `PUT /student/notifications/:id/read` — mark a notification as read

---

## Reports (`/reports`) — requires role `admin` or `teacher`

- `GET /reports/attendance?period_type=daily|weekly|monthly&from=&to=&class_id=&subject_id=`
  Teachers only see attendance they marked; Admins see everything.
- `GET /reports/attendance/export?format=pdf|excel&...same filters` — downloads a file
- `GET /reports/low-attendance` — students below the 75% threshold (configurable via `.env`)
- `POST /reports/low-attendance/notify` — **admin only**; creates notification rows for all low-attendance students

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation |
| 401 | Not authenticated |
| 403 | Not authorized for this role |
| 404 | Not found |
| 409 | Duplicate entry |
| 422 | Validation failed (express-validator) |
| 500 | Server error |

## Roles & Access Summary

| Role | Can access |
|---|---|
| **admin** | Everything under `/admin`, `/reports` (+ notify) |
| **teacher** | `/teacher/*`, `/reports` (own records only) |
| **student** | `/student/*` (own data only) |
