const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true
    },
    key: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        sparse: true, // Allow multiple nulls during creation
        maxlength: [10, 'Project key cannot exceed 10 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    status: {
        type: String,
        enum: ['planned', 'in_progress', 'completed'],
        default: 'planned'
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate key from project name if not provided
ProjectSchema.pre('save', async function () {
    if (this.isNew && !this.key) {
        // Generate key from first 4 chars of name, uppercase, alphanumeric only
        let baseKey = this.name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (baseKey.length === 0) baseKey = 'PROJ';

        // Ensure uniqueness
        let key = baseKey;
        let suffix = 1;
        while (await this.constructor.findOne({ key })) {
            key = `${baseKey}${suffix}`;
            suffix++;
        }
        this.key = key;
    }
});

module.exports = mongoose.model('Project', ProjectSchema);

