const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String, // HH:mm format
        required: true,
    },
    endTime: {
        type: String, // HH:mm format
        required: true,
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['pending', 'started', 'completed'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
