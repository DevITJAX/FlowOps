const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['project', 'task', 'user']
    },
    targetId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    details: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for Cosmos DB compatibility
ActivitySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
ActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
