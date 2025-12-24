const mongoose = require('mongoose');

const IssueLinkSchema = new mongoose.Schema({
    linkType: {
        type: String,
        enum: ['blocks', 'is_blocked_by', 'relates_to', 'duplicates', 'is_duplicated_by', 'clones', 'is_cloned_by'],
        required: [true, 'Link type is required']
    },
    sourceTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    targetTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate links
IssueLinkSchema.index({ sourceTask: 1, targetTask: 1, linkType: 1 }, { unique: true });

// Get reverse link type
IssueLinkSchema.statics.getReverseLinkType = function (linkType) {
    const reverseMap = {
        'blocks': 'is_blocked_by',
        'is_blocked_by': 'blocks',
        'relates_to': 'relates_to',
        'duplicates': 'is_duplicated_by',
        'is_duplicated_by': 'duplicates',
        'clones': 'is_cloned_by',
        'is_cloned_by': 'clones'
    };
    return reverseMap[linkType] || linkType;
};

module.exports = mongoose.model('IssueLink', IssueLinkSchema);
