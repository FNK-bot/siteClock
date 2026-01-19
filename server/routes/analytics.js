const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get Employee Work Time Analytics
// @route   GET /api/analytics/work-time
// @access  Admin Only
router.get('/work-time', protect, adminOnly, async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.clockInTime = {};
            if (startDate) dateFilter.clockInTime.$gte = new Date(startDate);
            if (endDate) dateFilter.clockInTime.$lte = new Date(endDate);
        }

        // Aggregate work hours by employee
        const workTimeData = await Attendance.aggregate([
            {
                $match: {
                    clockOutTime: { $exists: true }, // Only completed sessions
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalHours: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$clockOutTime', '$clockInTime'] },
                                1000 * 60 * 60 // Convert milliseconds to hours
                            ]
                        }
                    },
                    totalSessions: { $sum: 1 },
                    avgSessionHours: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$clockOutTime', '$clockInTime'] },
                                1000 * 60 * 60
                            ]
                        }
                    }
                }
            },
            {
                $sort: { totalHours: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        // Populate user details
        const populatedData = await User.populate(workTimeData, {
            path: '_id',
            select: 'name userId email'
        });

        // Format the response
        const formattedData = populatedData.map(item => ({
            employee: {
                id: item._id._id,
                name: item._id.name,
                userId: item._id.userId,
                email: item._id.email
            },
            totalHours: parseFloat(item.totalHours.toFixed(2)),
            totalSessions: item.totalSessions,
            avgSessionHours: parseFloat(item.avgSessionHours.toFixed(2))
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get Top Performing Employees
// @route   GET /api/analytics/top-performers
// @access  Admin Only
router.get('/top-performers', protect, adminOnly, async (req, res) => {
    try {
        const { period = '30', limit = 5 } = req.query;

        // Calculate start date based on period (days)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get employees with most completed tasks and hours worked
        const topPerformers = await Attendance.aggregate([
            {
                $match: {
                    clockOutTime: { $exists: true },
                    clockInTime: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$user',
                    completedTasks: { $sum: 1 },
                    totalHours: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$clockOutTime', '$clockInTime'] },
                                1000 * 60 * 60
                            ]
                        }
                    },
                    avgSessionHours: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$clockOutTime', '$clockInTime'] },
                                1000 * 60 * 60
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    // Performance score: weighted combination of completed tasks and hours
                    performanceScore: {
                        $add: [
                            { $multiply: ['$completedTasks', 10] }, // Each task = 10 points
                            { $multiply: ['$totalHours', 2] }       // Each hour = 2 points
                        ]
                    }
                }
            },
            {
                $sort: { performanceScore: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        // Populate user details
        const populatedPerformers = await User.populate(topPerformers, {
            path: '_id',
            select: 'name userId email'
        });

        // Format response
        const formattedPerformers = populatedPerformers.map((item, index) => ({
            rank: index + 1,
            employee: {
                id: item._id._id,
                name: item._id.name,
                userId: item._id.userId,
                email: item._id.email
            },
            completedTasks: item.completedTasks,
            totalHours: parseFloat(item.totalHours.toFixed(2)),
            avgSessionHours: parseFloat(item.avgSessionHours.toFixed(2)),
            performanceScore: parseFloat(item.performanceScore.toFixed(2))
        }));

        res.json(formattedPerformers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get Attendance Statistics
// @route   GET /api/analytics/attendance-stats
// @access  Admin Only
router.get('/attendance-stats', protect, adminOnly, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.clockInTime = {};
            if (startDate) dateFilter.clockInTime.$gte = new Date(startDate);
            if (endDate) dateFilter.clockInTime.$lte = new Date(endDate);
        }

        // Get total employees
        const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });

        // Get total attendance records
        const totalAttendance = await Attendance.countDocuments({
            clockOutTime: { $exists: true },
            ...dateFilter
        });

        // Get total hours worked
        const attendanceRecords = await Attendance.find({
            clockOutTime: { $exists: true },
            ...dateFilter
        });

        let totalMillis = 0;
        attendanceRecords.forEach(record => {
            totalMillis += (new Date(record.clockOutTime) - new Date(record.clockInTime));
        });
        const totalHours = (totalMillis / (1000 * 60 * 60)).toFixed(1);

        // Get unique active employees (who have clocked in at least once)
        const activeEmployeeIds = await Attendance.distinct('user', {
            ...dateFilter
        });
        const activeEmployees = activeEmployeeIds.length;

        // Calculate average hours per employee
        const avgHoursPerEmployee = activeEmployees > 0
            ? (parseFloat(totalHours) / activeEmployees).toFixed(2)
            : 0;

        // Get daily attendance trend (last 7 days if no date range specified)
        const trendStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trendEndDate = endDate ? new Date(endDate) : new Date();

        const dailyTrend = await Attendance.aggregate([
            {
                $match: {
                    clockInTime: { $gte: trendStartDate, $lte: trendEndDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$clockInTime' }
                    },
                    count: { $sum: 1 },
                    uniqueEmployees: { $addToSet: '$user' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    attendanceCount: '$count',
                    uniqueEmployees: { $size: '$uniqueEmployees' }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        res.json({
            overview: {
                totalEmployees,
                activeEmployees,
                totalAttendance,
                totalHours: parseFloat(totalHours),
                avgHoursPerEmployee: parseFloat(avgHoursPerEmployee)
            },
            dailyTrend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get Work Time Trend (for charts)
// @route   GET /api/analytics/work-time-trend
// @access  Admin Only
router.get('/work-time-trend', protect, adminOnly, async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const trendData = await Attendance.aggregate([
            {
                $match: {
                    clockInTime: { $gte: startDate },
                    clockOutTime: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$clockInTime' } },
                        user: '$user'
                    },
                    dailyHours: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$clockOutTime', '$clockInTime'] },
                                1000 * 60 * 60
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    totalHours: { $sum: '$dailyHours' },
                    avgHours: { $avg: '$dailyHours' },
                    employeeCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const formattedTrend = trendData.map(item => ({
            date: item._id,
            totalHours: parseFloat(item.totalHours.toFixed(2)),
            avgHours: parseFloat(item.avgHours.toFixed(2)),
            employeeCount: item.employeeCount
        }));

        res.json(formattedTrend);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
