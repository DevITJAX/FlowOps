const mongoose = require('mongoose');

const LabelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Label name is required'],
        trim: true,
        maxlength: [50, 'Label name cannot exceed 50 characters']
    },
    color: {
        type: String,
        default: '#6c757d',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
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

// Unique label name per project
LabelSchema.index({ name: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Label', LabelSchema);
