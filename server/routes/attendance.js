const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
router.post(
    '/clock-in',
    [
        protect,
        check('taskId', 'Task ID is required').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { taskId, latitude, longitude } = req.body;

        try {
            // 1. Check if task exists and user is assigned
            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (!task.employees.includes(req.user._id)) {
                return res.status(403).json({ message: 'You are not assigned to this task' });
            }

            // 2. Check if already clocked in
            const existingAttendance = await Attendance.findOne({
                task: taskId,
                user: req.user._id,
            });

            if (existingAttendance) {
                return res.status(400).json({ message: 'Already clocked in for this task' });
            }

            // 3. Create Attendance Record
            const attendanceData = {
                task: taskId,
                user: req.user._id,
                clockInTime: new Date(),
            };

            // Add location only if provided
            if (latitude !== undefined && longitude !== undefined) {
                attendanceData.clockInLocation = { latitude, longitude };
            }

            const attendance = await Attendance.create(attendanceData);

            // 4. Update Task Status to 'started' if it's pending
            if (task.status === 'pending') {
                task.status = 'started';
                await task.save();
            }

            res.status(201).json(attendance);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private
router.post(
    '/clock-out',
    [
        protect,
        check('taskId', 'Task ID is required').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { taskId, latitude, longitude } = req.body;

        try {
            const attendance = await Attendance.findOne({
                task: taskId,
                user: req.user._id,
            });

            if (!attendance) {
                return res.status(404).json({ message: 'No clock-in record found for this task' });
            }

            if (attendance.clockOutTime) {
                return res.status(400).json({ message: 'Already clocked out' });
            }

            attendance.clockOutTime = new Date();

            // Add location only if provided
            if (latitude !== undefined && longitude !== undefined) {
                attendance.clockOutLocation = { latitude, longitude };
            }

            await attendance.save();

            res.json(attendance);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Get Attendance History
// @route   GET /api/attendance/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const history = await Attendance.find({ user: req.user._id })
            .populate('task', 'title date startTime endTime')
            .sort({ clockInTime: -1 });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get Employee Stats (Analytics)
// @route   GET /api/attendance/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Total Completed Tasks
        // Find tasks assigned to user where date is < now or we can use attendance count
        // Better: Count attendance records where clockOutTime exists
        const completedTasksCount = await Attendance.countDocuments({
            user: userId,
            clockOutTime: { $exists: true }
        });

        // 2. Pending Tasks
        // Find tasks assigned to user, date >= today (broad approximation)
        // This is a bit tricky without complex query, let's keep it simple
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingTasksCount = await Task.countDocuments({
            employees: userId,
            date: { $gte: today }
        });

        // 3. Total Hours Worked
        // Aggregate duration
        const attendanceRecords = await Attendance.find({
            user: userId,
            clockOutTime: { $exists: true }
        });

        let totalMillis = 0;
        attendanceRecords.forEach(record => {
            totalMillis += (new Date(record.clockOutTime) - new Date(record.clockInTime));
        });
        const totalHours = (totalMillis / (1000 * 60 * 60)).toFixed(1);

        // 4. Days Present (Unique dates in attendance)
        // Not efficiently querying unique dates here but good enough for small scale
        const presentDates = new Set(attendanceRecords.map(r => new Date(r.clockInTime).toDateString()));
        const daysPresent = presentDates.size;

        res.json({
            completedTasks: completedTasksCount,
            upcomingTasks: upcomingTasksCount,
            totalHours: parseFloat(totalHours),
            daysPresent: daysPresent
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
