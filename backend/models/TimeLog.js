const mongoose = require('mongoose');

const TimeLogSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    timeSpent: {
        type: Number, // in minutes
        required: [true, 'Time spent is required'],
        min: [1, 'Time spent must be at least 1 minute']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    loggedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TimeLog', TimeLogSchema);
