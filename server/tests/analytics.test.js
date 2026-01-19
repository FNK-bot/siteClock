const request = require('supertest');
const express = require('express');
const analyticsRouter = require('../routes/analytics');
const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRouter);

describe('Analytics API Routes', () => {
    let adminToken;
    let adminUser;
    let employee1, employee2;
    let task1, task2;

    beforeEach(async () => {
        // Create admin user
        adminUser = await User.create({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // Generate JWT token for admin
        adminToken = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        );

        // Create employee users
        employee1 = await User.create({
            name: 'Employee One',
            userId: 'EMP001',
            email: 'emp1@test.com',
            password: 'password123',
            role: 'employee'
        });

        employee2 = await User.create({
            name: 'Employee Two',
            userId: 'EMP002',
            email: 'emp2@test.com',
            password: 'password123',
            role: 'employee'
        });

        // Create tasks
        task1 = await Task.create({
            title: 'Task 1',
            date: new Date(),
            startTime: '09:00',
            endTime: '17:00',
            employees: [employee1._id],
            status: 'pending'
        });

        task2 = await Task.create({
            title: 'Task 2',
            date: new Date(),
            startTime: '10:00',
            endTime: '18:00',
            employees: [employee2._id],
            status: 'pending'
        });

        // Create attendance records
        const now = new Date();
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

        await Attendance.create({
            task: task1._id,
            user: employee1._id,
            clockInTime: fourHoursAgo,
            clockOutTime: now,
            clockInLocation: { latitude: 0, longitude: 0 },
            clockOutLocation: { latitude: 0, longitude: 0 }
        });

        await Attendance.create({
            task: task2._id,
            user: employee2._id,
            clockInTime: fourHoursAgo,
            clockOutTime: now,
            clockInLocation: { latitude: 0, longitude: 0 },
            clockOutLocation: { latitude: 0, longitude: 0 }
        });
    });

    describe('GET /api/analytics/work-time', () => {
        it('should return work time data for employees', async () => {
            const response = await request(app)
                .get('/api/analytics/work-time')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const firstEmployee = response.body[0];
            expect(firstEmployee).toHaveProperty('employee');
            expect(firstEmployee).toHaveProperty('totalHours');
            expect(firstEmployee).toHaveProperty('totalSessions');
            expect(firstEmployee).toHaveProperty('avgSessionHours');
        });

        it('should require admin authentication', async () => {
            await request(app)
                .get('/api/analytics/work-time')
                .expect(401);
        });

        it('should accept limit query parameter', async () => {
            const response = await request(app)
                .get('/api/analytics/work-time?limit=1')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.length).toBeLessThanOrEqual(1);
        });
    });

    describe('GET /api/analytics/top-performers', () => {
        it('should return ranked list of top performers', async () => {
            const response = await request(app)
                .get('/api/analytics/top-performers')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            if (response.body.length > 0) {
                const performer = response.body[0];
                expect(performer).toHaveProperty('rank');
                expect(performer).toHaveProperty('employee');
                expect(performer).toHaveProperty('completedTasks');
                expect(performer).toHaveProperty('totalHours');
                expect(performer).toHaveProperty('performanceScore');
            }
        });

        it('should require admin authentication', async () => {
            await request(app)
                .get('/api/analytics/top-performers')
                .expect(401);
        });

        it('should accept period and limit parameters', async () => {
            const response = await request(app)
                .get('/api/analytics/top-performers?period=7&limit=5')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.length).toBeLessThanOrEqual(5);
        });
    });

    describe('GET /api/analytics/attendance-stats', () => {
        it('should return attendance statistics', async () => {
            const response = await request(app)
                .get('/api/analytics/attendance-stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('overview');
            expect(response.body.overview).toHaveProperty('totalEmployees');
            expect(response.body.overview).toHaveProperty('activeEmployees');
            expect(response.body.overview).toHaveProperty('totalHours');
            expect(response.body.overview).toHaveProperty('avgHoursPerEmployee');
            expect(response.body).toHaveProperty('dailyTrend');
            expect(Array.isArray(response.body.dailyTrend)).toBe(true);
        });

        it('should require admin authentication', async () => {
            await request(app)
                .get('/api/analytics/attendance-stats')
                .expect(401);
        });
    });

    describe('GET /api/analytics/work-time-trend', () => {
        it('should return work time trend data', async () => {
            const response = await request(app)
                .get('/api/analytics/work-time-trend')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            if (response.body.length > 0) {
                const trendData = response.body[0];
                expect(trendData).toHaveProperty('date');
                expect(trendData).toHaveProperty('totalHours');
                expect(trendData).toHaveProperty('avgHours');
                expect(trendData).toHaveProperty('employeeCount');
            }
        });

        it('should require admin authentication', async () => {
            await request(app)
                .get('/api/analytics/work-time-trend')
                .expect(401);
        });

        it('should accept days parameter', async () => {
            const response = await request(app)
                .get('/api/analytics/work-time-trend?days=30')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
