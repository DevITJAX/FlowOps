const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mentions: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

// Index for Cosmos DB compatibility
CommentSchema.index({ task: 1, createdAt: -1 });

// Update the updatedAt field on save
CommentSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.updatedAt = Date.now();
        this.isEdited = true;
    }
    next();
});

module.exports = mongoose.model('Comment', CommentSchema);
