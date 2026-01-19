const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clockInTime: {
        type: Date,
        required: true,
    },
    clockInLocation: {
        latitude: Number,
        longitude: Number,
    },
    clockOutTime: {
        type: Date,
    },
    clockOutLocation: {
        latitude: Number,
        longitude: Number,
    },
}, {
    timestamps: true,
});

// Prevent duplicate clock-ins for the same task and user
attendanceSchema.index({ task: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
