const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

describe('User Model', () => {
    it('should create a user with required fields', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'employee'
        };

        const user = await User.create(userData);

        expect(user.name).toBe(userData.name);
        expect(user.email).toBe(userData.email);
        expect(user.role).toBe(userData.role);
        expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should auto-generate userId for employees', async () => {
        const user = await User.create({
            name: 'Employee',
            email: 'employee@test.com',
            password: 'password123',
            role: 'employee'
        });

        expect(user.userId).toBeDefined();
        expect(user.userId).toMatch(/^EMP/);
    });

    it('should hash password before saving', async () => {
        const password = 'mySecretPassword';
        const user = await User.create({
            name: 'Test',
            email: 'hash@test.com',
            password: password,
            role: 'employee'
        });

        expect(user.password).not.toBe(password);
        expect(user.password.length).toBeGreaterThan(password.length);
    });

    it('should match password correctly', async () => {
        const password = 'testPassword123';
        const user = await User.create({
            name: 'Test',
            email: 'match@test.com',
            password: password,
            role: 'employee'
        });

        const isMatch = await user.matchPassword(password);
        expect(isMatch).toBe(true);

        const isNotMatch = await user.matchPassword('wrongPassword');
        expect(isNotMatch).toBe(false);
    });

    it('should set default role to employee', async () => {
        const user = await User.create({
            name: 'Test',
            email: 'default@test.com',
            password: 'password123'
        });

        expect(user.role).toBe('employee');
    });

    it('should set active status to true by default', async () => {
        const user = await User.create({
            name: 'Test',
            email: 'active@test.com',
            password: 'password123',
            role: 'employee'
        });

        expect(user.isActive).toBe(true);
    });
});

describe('Attendance Model', () => {
    let user, task;

    beforeEach(async () => {
        user = await User.create({
            name: 'Test Employee',
            email: 'emp@test.com',
            password: 'password123',
            role: 'employee'
        });

        task = await Task.create({
            title: 'Test Task',
            date: new Date(),
            startTime: '09:00',
            endTime: '17:00',
            employees: [user._id],
            status: 'pending'
        });
    });

    it('should create attendance record with required fields', async () => {
        const attendance = await Attendance.create({
            task: task._id,
            user: user._id,
            clockInTime: new Date(),
            clockInLocation: { latitude: 40.7128, longitude: -74.0060 }
        });

        expect(attendance.task).toEqual(task._id);
        expect(attendance.user).toEqual(user._id);
        expect(attendance.clockInTime).toBeDefined();
        expect(attendance.clockInLocation.latitude).toBe(40.7128);
    });

    it('should allow clock out after clock in', async () => {
        const clockIn = new Date();
        const attendance = await Attendance.create({
            task: task._id,
            user: user._id,
            clockInTime: clockIn,
            clockInLocation: { latitude: 40, longitude: -74 }
        });

        const clockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
        attendance.clockOutTime = clockOut;
        attendance.clockOutLocation = { latitude: 40, longitude: -74 };
        await attendance.save();

        expect(attendance.clockOutTime).toEqual(clockOut);
        expect(attendance.clockOutLocation).toBeDefined();
    });

    it('should prevent duplicate attendance for same task and user', async () => {
        await Attendance.create({
            task: task._id,
            user: user._id,
            clockInTime: new Date(),
            clockInLocation: { latitude: 40, longitude: -74 }
        });

        await expect(
            Attendance.create({
                task: task._id,
                user: user._id,
                clockInTime: new Date(),
                clockInLocation: { latitude: 40, longitude: -74 }
            })
        ).rejects.toThrow();
    });
});

describe('Task Model', () => {
    let employee;

    beforeEach(async () => {
        employee = await User.create({
            name: 'Employee',
            email: 'task-emp@test.com',
            password: 'password123',
            role: 'employee'
        });
    });

    it('should create task with required fields', async () => {
        const taskData = {
            title: 'Test Task',
            date: new Date('2024-01-15'),
            startTime: '09:00',
            endTime: '17:00',
            employees: [employee._id],
            status: 'pending'
        };

        const task = await Task.create(taskData);

        expect(task.title).toBe(taskData.title);
        expect(task.date).toEqual(taskData.date);
        expect(task.startTime).toBe(taskData.startTime);
        expect(task.endTime).toBe(taskData.endTime);
        expect(task.status).toBe('pending');
    });

    it('should default status to pending', async () => {
        const task = await Task.create({
            title: 'New Task',
            date: new Date(),
            startTime: '09:00',
            endTime: '17:00',
            employees: [employee._id]
        });

        expect(task.status).toBe('pending');
    });

    it('should allow valid status values', async () => {
        const statuses = ['pending', 'started', 'completed'];

        for (const status of statuses) {
            const task = await Task.create({
                title: `Task ${status}`,
                date: new Date(),
                startTime: '09:00',
                endTime: '17:00',
                employees: [employee._id],
                status: status
            });

            expect(task.status).toBe(status);
        }
    });

    it('should populate employees', async () => {
        const task = await Task.create({
            title: 'Task with Employee',
            date: new Date(),
            startTime: '09:00',
            endTime: '17:00',
            employees: [employee._id],
            status: 'pending'
        });

        const populatedTask = await Task.findById(task._id).populate('employees');

        expect(populatedTask.employees).toHaveLength(1);
        expect(populatedTask.employees[0].name).toBe(employee.name);
    });
});
