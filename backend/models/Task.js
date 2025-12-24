const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    type: {
        type: String,
        enum: ['task', 'bug', 'story', 'epic', 'subtask'],
        default: 'task'
    },
    status: {
        type: String,
        enum: ['todo', 'doing', 'review', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['lowest', 'low', 'medium', 'high', 'highest'],
        default: 'medium'
    },
    storyPoints: {
        type: Number,
        enum: [0, 1, 2, 3, 5, 8, 13, 21],
        default: 0
    },
    originalEstimate: {
        type: Number, // in minutes
        default: 0
    },
    timeSpent: {
        type: Number, // in minutes (aggregated from time logs)
        default: 0
    },
    remainingEstimate: {
        type: Number, // in minutes
        default: 0
    },
    dueDate: {
        type: Date
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    assignee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    labels: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Label'
    }],
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
    },
    watchers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    sprint: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sprint'
    },
    taskKey: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate task key before saving (e.g., PROJ-1, PROJ-2)
TaskSchema.pre('save', async function (next) {
    if (this.isNew && !this.taskKey) {
        const Project = mongoose.model('Project');
        const project = await Project.findById(this.project);
        const count = await this.constructor.countDocuments({ project: this.project });
        const prefix = project?.name?.substring(0, 4).toUpperCase() || 'TASK';
        this.taskKey = `${prefix}-${count + 1}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', TaskSchema);
