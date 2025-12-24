const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'task_assigned',
            'task_commented',
            'task_mentioned',
            'task_status_changed',
            'sprint_started',
            'sprint_completed',
            'task_due_soon'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    relatedTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
    },
    relatedProject: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
