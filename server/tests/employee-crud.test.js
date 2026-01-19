const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Employee CRUD API Routes', () => {
    let adminToken;
    let adminUser;
    let testEmployee;

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
    });

    describe('POST /api/auth/register (CREATE Employee)', () => {
        it('should create a new employee with auto-generated userId', async () => {
            const employeeData = {
                name: 'Test Employee',
                phone: '1234567890',
                email: 'employee@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(employeeData)
                .expect(201);

            expect(response.body).toHaveProperty('userId');
            expect(response.body.userId).toMatch(/^EMP/);
            expect(response.body.name).toBe(employeeData.name);
            expect(response.body.phone).toBe(employeeData.phone);
            expect(response.body.role).toBe('employee');

            testEmployee = response.body;
        });

        it('should require admin authentication', async () => {
            const employeeData = {
                name: 'Test Employee',
                phone: '1234567890',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(employeeData)
                .expect(401);
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test' }) // Missing phone and password
                .expect(400);

            expect(response.body).toHaveProperty('errors');
        });

        it('should prevent duplicate phone numbers', async () => {
            const employeeData = {
                name: 'First Employee',
                phone: '9999999999',
                password: 'password123'
            };

            // Create first employee
            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(employeeData)
                .expect(201);

            // Try to create second with same phone
            await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...employeeData, name: 'Second Employee' })
                .expect(400);
        });
    });

    describe('GET /api/auth/employees (READ Employees)', () => {
        beforeEach(async () => {
            // Create test employees
            await User.create([
                { name: 'Employee 1', phone: '1111111111', password: 'pass123', role: 'employee' },
                { name: 'Employee 2', phone: '2222222222', password: 'pass123', role: 'employee' },
                { name: 'Employee 3', phone: '3333333333', password: 'pass123', role: 'employee', isActive: false },
            ]);
        });

        it('should return all employees', async () => {
            const response = await request(app)
                .get('/api/auth/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
        });

        it('should not include password in response', async () => {
            const response = await request(app)
                .get('/api/auth/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            response.body.forEach(emp => {
                expect(emp).not.toHaveProperty('password');
            });
        });

        it('should require admin authentication', async () => {
            await request(app)
                .get('/api/auth/employees')
                .expect(401);
        });
    });

    describe('PUT /api/auth/employee/:id (UPDATE Employee)', () => {
        beforeEach(async () => {
            testEmployee = await User.create({
                name: 'Update Test Employee',
                phone: '5555555555',
                email: 'update@test.com',
                password: 'password123',
                role: 'employee'
            });
        });

        it('should update employee details', async () => {
            const updates = {
                name: 'Updated Name',
                phone: '6666666666',
                email: 'updated@test.com'
            };

            const response = await request(app)
                .put(`/api/auth/employee/${testEmployee._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.name).toBe(updates.name);
            expect(response.body.phone).toBe(updates.phone);
            expect(response.body.email).toBe(updates.email);
        });

        it('should update isActive status', async () => {
            const response = await request(app)
                .put(`/api/auth/employee/${testEmployee._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false })
                .expect(200);

            expect(response.body.isActive).toBe(false);
        });

        it('should require admin authentication', async () => {
            await request(app)
                .put(`/api/auth/employee/${testEmployee._id}`)
                .send({ name: 'New Name' })
                .expect(401);
        });

        it('should prevent duplicate phone numbers', async () => {
            // Create another employee
            const anotherEmployee = await User.create({
                name: 'Another Employee',
                phone: '7777777777',
                password: 'password123',
                role: 'employee'
            });

            // Try to update testEmployee with anotherEmployee's phone
            const response = await request(app)
                .put(`/api/auth/employee/${testEmployee._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ phone: '7777777777' })
                .expect(400);

            expect(response.body.message).toContain('already in use');
        });
    });

    describe('DELETE /api/auth/employee/:id (DELETE Employee - Soft Delete)', () => {
        beforeEach(async () => {
            testEmployee = await User.create({
                name: 'Delete Test Employee',
                phone: '8888888888',
                password: 'password123',
                role: 'employee'
            });
        });

        it('should deactivate (soft delete) employee', async () => {
            await request(app)
                .delete(`/api/auth/employee/${testEmployee._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Verify employee is deactivated
            const employee = await User.findById(testEmployee._id);
            expect(employee.isActive).toBe(false);
        });

        it('should require admin authentication', async () => {
            await request(app)
                .delete(`/api/auth/employee/${testEmployee._id}`)
                .expect(401);
        });

        it('should return 404 for non-employee users', async () => {
            await request(app)
                .delete(`/api/auth/employee/${adminUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});
