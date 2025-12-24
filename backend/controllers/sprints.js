const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all sprints for a project
// @route   GET /api/projects/:projectId/sprints
// @access  Private
exports.getSprints = async (req, res, next) => {
    try {
        const sprints = await Sprint.find({ project: req.params.projectId })
            .populate('createdBy', 'name')
            .sort({ startDate: -1 });

        res.status(200).json({
            success: true,
            count: sprints.length,
            data: sprints
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single sprint with tasks
// @route   GET /api/sprints/:id
// @access  Private
exports.getSprint = async (req, res, next) => {
    try {
        const sprint = await Sprint.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        // Get tasks in this sprint
        const tasks = await Task.find({ sprint: sprint._id })
            .populate('assignee', 'name email')
            .populate('labels', 'name color');

        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = tasks.filter(t => t.status === 'done')
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                ...sprint.toJSON(),
                tasks,
                totalPoints,
                completedPoints,
                taskCount: tasks.length,
                completedCount: tasks.filter(t => t.status === 'done').length
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create sprint
// @route   POST /api/projects/:projectId/sprints
// @access  Private
exports.createSprint = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const sprint = await Sprint.create({
            name: req.body.name,
            goal: req.body.goal,
            project: req.params.projectId,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: sprint });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private
exports.updateSprint = async (req, res, next) => {
    try {
        let sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: sprint });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Start sprint
// @route   PUT /api/sprints/:id/start
// @access  Private
exports.startSprint = async (req, res, next) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        if (sprint.status !== 'planned') {
            return res.status(400).json({ success: false, message: 'Sprint is not in planned status' });
        }

        sprint.status = 'active';
        await sprint.save();

        res.status(200).json({ success: true, data: sprint });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Complete sprint
// @route   PUT /api/sprints/:id/complete
// @access  Private
exports.completeSprint = async (req, res, next) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        if (sprint.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Sprint is not active' });
        }

        // Calculate velocity from completed tasks
        const tasks = await Task.find({ sprint: sprint._id, status: 'done' });
        const completedPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        sprint.status = 'completed';
        sprint.completedPoints = completedPoints;
        sprint.velocity = completedPoints;

        // Move incomplete tasks to backlog
        if (req.body.moveToBacklog) {
            await Task.updateMany(
                { sprint: sprint._id, status: { $ne: 'done' } },
                { $unset: { sprint: 1 } }
            );
        }

        await sprint.save();

        res.status(200).json({ success: true, data: sprint });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private
exports.deleteSprint = async (req, res, next) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        // Move tasks back to backlog
        await Task.updateMany(
            { sprint: sprint._id },
            { $unset: { sprint: 1 } }
        );

        await sprint.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get backlog tasks (tasks without sprint)
// @route   GET /api/projects/:projectId/backlog
// @access  Private
exports.getBacklog = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const tasks = await Task.find({
            project: req.params.projectId,
            sprint: { $exists: false }
        })
            .populate('assignee', 'name email')
            .populate('labels', 'name color')
            .sort({ createdAt: -1 });

        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        res.status(200).json({
            success: true,
            count: tasks.length,
            totalPoints,
            data: tasks
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Move tasks to sprint
// @route   POST /api/sprints/:id/tasks
// @access  Private
exports.moveTasksToSprint = async (req, res, next) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({ success: false, message: 'Sprint not found' });
        }

        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds)) {
            return res.status(400).json({ success: false, message: 'taskIds array is required' });
        }

        await Task.updateMany(
            { _id: { $in: taskIds } },
            { sprint: sprint._id }
        );

        res.status(200).json({ success: true, message: `${taskIds.length} tasks moved to sprint` });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Remove tasks from sprint (move to backlog)
// @route   DELETE /api/sprints/:id/tasks
// @access  Private
exports.removeTasksFromSprint = async (req, res, next) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds)) {
            return res.status(400).json({ success: false, message: 'taskIds array is required' });
        }

        await Task.updateMany(
            { _id: { $in: taskIds } },
            { $unset: { sprint: 1 } }
        );

        res.status(200).json({ success: true, message: `${taskIds.length} tasks moved to backlog` });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get project velocity (last N sprints)
// @route   GET /api/projects/:projectId/velocity
// @access  Private
exports.getVelocity = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const sprints = await Sprint.find({
            project: req.params.projectId,
            status: 'completed'
        })
            .sort({ endDate: -1 })
            .limit(limit);

        const velocities = sprints.map(s => ({
            name: s.name,
            velocity: s.velocity,
            startDate: s.startDate,
            endDate: s.endDate
        }));

        const avgVelocity = sprints.length > 0
            ? Math.round(sprints.reduce((sum, s) => sum + s.velocity, 0) / sprints.length)
            : 0;

        res.status(200).json({
            success: true,
            avgVelocity,
            data: velocities.reverse()
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
