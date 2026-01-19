const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, admin } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Helper function to check time overlap
const checkTimeOverlap = (start1, end1, start2, end2) => {
    // Convert time strings (HH:mm) to minutes for comparison
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    // Check if times overlap
    return (s1 < e2 && e1 > s2);
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
router.post(
    '/',
    [
        protect,
        admin,
        check('title', 'Title is required').not().isEmpty(),
        check('date', 'Date is required').not().isEmpty(),
        check('startTime', 'Start time is required').not().isEmpty(),
        check('endTime', 'End time is required').not().isEmpty(),
        check('employees', 'Employees (array of IDs) are required').isArray({ min: 1 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, date, startTime, endTime, employees } = req.body;

        try {
            // Validate start time is before end time
            if (startTime >= endTime) {
                return res.status(400).json({ message: 'Start time must be before end time' });
            }

            // Check for time conflicts with existing tasks on the same date
            const existingTasks = await Task.find({
                date: new Date(date),
                status: { $ne: 'completed' } // Only check non-completed tasks
            });

            const hasConflict = existingTasks.some(task =>
                checkTimeOverlap(startTime, endTime, task.startTime, task.endTime)
            );

            if (hasConflict) {
                return res.status(400).json({
                    message: 'Time conflict: Another task is already scheduled during this time period'
                });
            }

            // Validate employees exist
            const foundEmployees = await User.find({
                _id: { $in: employees },
                role: 'employee',
                isActive: true
            });

            if (foundEmployees.length !== employees.length) {
                return res.status(400).json({ message: 'One or more employee IDs are invalid or inactive' });
            }

            const task = await Task.create({
                title,
                date,
                startTime,
                endTime,
                employees,
                createdBy: req.user._id,
            });

            const populatedTask = await Task.findById(task._id).populate('employees', 'name userId phone');
            res.status(201).json(populatedTask);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Get all tasks (Admin view)
// @route   GET /api/tasks/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const tasks = await Task.find({}).populate('employees', 'name userId phone').sort({ date: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get tasks for logged in employee with attendance status
// @route   GET /api/tasks/my
// @access  Private/Employee
router.get('/my', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await Task.find({
            employees: req.user._id,
            date: { $gte: today },
        })
            .populate('createdBy', 'name')
            .sort({ date: 1, startTime: 1 })
            .lean();

        // Append attendance status
        for (let task of tasks) {
            const attendance = await Attendance.findOne({
                task: task._id,
                user: req.user._id
            });

            if (attendance) {
                task.myAttendance = {
                    clockInTime: attendance.clockInTime,
                    clockOutTime: attendance.clockOutTime,
                    status: attendance.clockOutTime ? 'clocked-out' : 'clocked-in'
                };
            } else {
                task.myAttendance = null;
            }
        }

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Add employees to a task
// @route   PUT /api/tasks/:id/employees/add
// @access  Private/Admin
router.put(
    '/:id/employees/add',
    [
        protect,
        admin,
        check('employeeIds', 'Employee IDs array is required').isArray({ min: 1 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { employeeIds } = req.body;

        try {
            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            // Validate employees exist and are active
            const foundEmployees = await User.find({
                _id: { $in: employeeIds },
                role: 'employee',
                isActive: true
            });

            if (foundEmployees.length !== employeeIds.length) {
                return res.status(400).json({ message: 'One or more employee IDs are invalid or inactive' });
            }

            // Add only new employees (avoid duplicates)
            const newEmployees = employeeIds.filter(id => !task.employees.includes(id));

            if (newEmployees.length === 0) {
                return res.status(400).json({ message: 'All selected employees are already assigned to this task' });
            }

            task.employees = [...task.employees, ...newEmployees];
            await task.save();

            const populatedTask = await Task.findById(task._id).populate('employees', 'name userId phone');
            res.json(populatedTask);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Remove employee from a task
// @route   PUT /api/tasks/:id/employees/remove
// @access  Private/Admin
router.put(
    '/:id/employees/remove',
    [
        protect,
        admin,
        check('employeeId', 'Employee ID is required').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { employeeId } = req.body;

        try {
            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (!task.employees.includes(employeeId)) {
                return res.status(400).json({ message: 'Employee is not assigned to this task' });
            }

            // Don't allow removing the last employee
            if (task.employees.length === 1) {
                return res.status(400).json({ message: 'Cannot remove the last employee from a task' });
            }

            task.employees = task.employees.filter(id => id.toString() !== employeeId);
            await task.save();

            const populatedTask = await Task.findById(task._id).populate('employees', 'name userId phone');
            res.json(populatedTask);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Get task details with employee attendance status
// @route   GET /api/tasks/:id/attendance
// @access  Private/Admin
router.get('/:id/attendance', protect, admin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('employees', 'name userId phone');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get attendance records for this task
        const attendanceRecords = await Attendance.find({ task: req.params.id })
            .populate('user', 'name userId phone');

        // Build employee status map
        const employeeStatuses = task.employees.map(employee => {
            const attendance = attendanceRecords.find(
                record => record.user._id.toString() === employee._id.toString()
            );

            if (!attendance) {
                return {
                    employee: {
                        _id: employee._id,
                        name: employee.name,
                        userId: employee.userId,
                        phone: employee.phone,
                    },
                    status: 'not-started',
                    clockInTime: null,
                    clockOutTime: null,
                    workingTime: 0,
                };
            }

            // Calculate working time in minutes
            let workingTime = 0;
            if (attendance.clockInTime) {
                const endTime = attendance.clockOutTime || new Date();
                workingTime = Math.floor((endTime - attendance.clockInTime) / (1000 * 60));
            }

            return {
                employee: {
                    _id: employee._id,
                    name: employee.name,
                    userId: employee.userId,
                    phone: employee.phone,
                },
                status: attendance.clockOutTime ? 'clocked-out' : 'working',
                clockInTime: attendance.clockInTime,
                clockOutTime: attendance.clockOutTime,
                workingTime, // in minutes
            };
        });

        res.json({
            task: {
                _id: task._id,
                title: task.title,
                date: task.date,
                startTime: task.startTime,
                endTime: task.endTime,
                status: task.status,
            },
            employees: employeeStatuses,
            summary: {
                total: employeeStatuses.length,
                working: employeeStatuses.filter(e => e.status === 'working').length,
                completed: employeeStatuses.filter(e => e.status === 'clocked-out').length,
                notStarted: employeeStatuses.filter(e => e.status === 'not-started').length,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
