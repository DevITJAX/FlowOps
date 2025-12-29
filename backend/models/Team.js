const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['lead', 'developer', 'designer', 'qa', 'devops', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [100, 'Team name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    color: {
        type: String,
        default: '#6366f1',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
    },
    lead: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    members: [TeamMemberSchema],
    isDefault: {
        type: Boolean,
        default: false
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

// Indexes for Cosmos DB compatibility
TeamSchema.index({ project: 1 });
TeamSchema.index({ project: 1, name: 1 }, { unique: true });

// Virtual for member count
TeamSchema.virtual('memberCount').get(function () {
    return this.members ? this.members.length : 0;
});

TeamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Team', TeamSchema);
