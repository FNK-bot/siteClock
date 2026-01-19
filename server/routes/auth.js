const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post(
    '/login',
    [
        check('identifier', 'User ID or Email is required').not().isEmpty(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password } = req.body;

        try {
            // Try to find user by userId first, then by email
            let user = await User.findOne({ userId: identifier });
            if (!user) {
                user = await User.findOne({ email: identifier });
            }

            if (user && (await user.matchPassword(password))) {
                if (!user.isActive) {
                    return res.status(401).json({ message: 'Account is deactivated' });
                }

                res.json({
                    _id: user._id,
                    name: user.name,
                    userId: user.userId,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Register a new employee (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
router.post(
    '/register',
    [
        protect,
        admin,
        check('name', 'Name is required').not().isEmpty(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, email, password, userId } = req.body;

        try {
            // Check if phone already exists (only if phone is provided)
            if (phone) {
                const phoneExists = await User.findOne({ phone });
                if (phoneExists) {
                    return res.status(400).json({ message: 'Phone number already registered' });
                }
            }

            // Check if userId already exists (if provided)
            if (userId) {
                const userIdExists = await User.findOne({ userId });
                if (userIdExists) {
                    return res.status(400).json({ message: 'User ID already exists' });
                }
            }

            const user = await User.create({
                name,
                phone: phone || undefined,
                email: email || undefined,
                password,
                userId: userId || undefined, // Will be auto-generated if not provided
                role: 'employee',
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    userId: user.userId,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @desc    Get all employees
// @route   GET /api/auth/employees
// @access  Private/Admin
router.get('/employees', protect, admin, async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update employee
// @route   PUT /api/auth/employee/:id
// @access  Private/Admin
router.put('/employee/:id', protect, admin, async (req, res) => {
    try {
        const { name, phone, email, isActive } = req.body;

        const employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if phone is being changed and if it's already taken
        if (phone && phone !== employee.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: req.params.id } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        employee.name = name || employee.name;
        employee.phone = phone || employee.phone;
        employee.email = email !== undefined ? email : employee.email;
        employee.isActive = isActive !== undefined ? isActive : employee.isActive;

        await employee.save();

        res.json({
            _id: employee._id,
            name: employee.name,
            userId: employee.userId,
            phone: employee.phone,
            email: employee.email,
            role: employee.role,
            isActive: employee.isActive,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete/Deactivate employee
// @route   DELETE /api/auth/employee/:id
// @access  Private/Admin
router.delete('/employee/:id', protect, admin, async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Soft delete - deactivate instead of removing
        employee.isActive = false;
        await employee.save();

        res.json({ message: 'Employee deactivated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
