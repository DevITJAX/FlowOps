const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Format file size for display
AttachmentSchema.virtual('formattedSize').get(function () {
    const bytes = this.size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
});

AttachmentSchema.set('toJSON', { virtuals: true });

// Index for Cosmos DB compatibility
AttachmentSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model('Attachment', AttachmentSchema);
