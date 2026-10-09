// ============================================================
// Admin Routes: /api/admin  (all routes require admin role)
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard-stats', ctrl.getDashboardStats);

// Departments
router.get('/departments', ctrl.getDepartments);
router.post('/departments', [body('name').notEmpty(), body('code').notEmpty()], validate, ctrl.createDepartment);
router.put('/departments/:id', [body('name').notEmpty(), body('code').notEmpty()], validate, ctrl.updateDepartment);
router.delete('/departments/:id', ctrl.deleteDepartment);

// Classes
router.get('/classes', ctrl.getClasses);
router.post('/classes', [body('name').notEmpty(), body('department_id').isInt(), body('year').isInt(), body('section').notEmpty()], validate, ctrl.createClass);
router.put('/classes/:id', ctrl.updateClass);
router.delete('/classes/:id', ctrl.deleteClass);

// Subjects
router.get('/subjects', ctrl.getSubjects);
router.post('/subjects', [body('name').notEmpty(), body('code').notEmpty(), body('department_id').isInt(), body('class_id').isInt()], validate, ctrl.createSubject);
router.put('/subjects/:id', ctrl.updateSubject);
router.delete('/subjects/:id', ctrl.deleteSubject);

// Teachers
router.get('/teachers', ctrl.getTeachers);
router.post('/teachers', [body('name').notEmpty(), body('email').isEmail(), body('employee_code').notEmpty(), body('department_id').isInt()], validate, ctrl.createTeacher);
router.put('/teachers/:id', ctrl.updateTeacher);
router.delete('/teachers/:id', ctrl.deleteTeacher);

// Students
router.get('/students', ctrl.getStudents);
router.post('/students', [body('name').notEmpty(), body('email').isEmail(), body('roll_number').notEmpty(), body('class_id').isInt(), body('department_id').isInt()], validate, ctrl.createStudent);
router.put('/students/:id', ctrl.updateStudent);
router.delete('/students/:id', ctrl.deleteStudent);

module.exports = router;
