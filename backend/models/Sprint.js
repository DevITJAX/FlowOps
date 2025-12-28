const mongoose = require('mongoose');

const SprintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sprint name is required'],
        trim: true,
        maxlength: [100, 'Sprint name cannot exceed 100 characters']
    },
    goal: {
        type: String,
        maxlength: [500, 'Sprint goal cannot exceed 500 characters']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        enum: ['planned', 'active', 'completed'],
        default: 'planned'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    velocity: {
        type: Number,
        default: 0
    },
    completedPoints: {
        type: Number,
        default: 0
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

// Ensure only one active sprint per project
SprintSchema.pre('save', async function (next) {
    try {
        if (this.status === 'active') {
            const existingActive = await this.constructor.findOne({
                project: this.project,
                status: 'active',
                _id: { $ne: this._id }
            });
            if (existingActive) {
                return next(new Error('Project already has an active sprint'));
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Calculate duration in days
SprintSchema.virtual('durationDays').get(function () {
    if (this.startDate && this.endDate) {
        const diff = this.endDate - this.startDate;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
});

SprintSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Sprint', SprintSchema);
