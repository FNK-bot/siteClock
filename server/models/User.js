const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined for admin
    },
    email: {
        type: String,
        sparse: true, // Allows duplicates of null/undefined
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Auto-generate userId for employees if not provided
userSchema.pre('save', function (next) {
    if (this.role === 'employee' && !this.userId) {
        // Generate userId: EMP + timestamp + random 3 digits
        this.userId = `EMP${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
