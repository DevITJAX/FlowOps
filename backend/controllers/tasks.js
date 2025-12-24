const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check access
        if (req.user.role !== 'admin' &&
            project.owner.toString() !== req.user.id &&
            !project.members.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access tasks for this project' });
        }

        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('labels', 'name color')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('labels', 'name color')
            .populate('watchers', 'name email')
            .populate('parent', 'title taskKey');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
    try {
        req.body.project = req.params.projectId;
        req.body.reporter = req.user.id;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if user is owner, admin, or member
        if (project.owner.toString() !== req.user.id &&
            req.user.role !== 'admin' &&
            !project.members.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to add tasks to this project' });
        }

        const task = await Task.create(req.body);

        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('labels', 'name color');

        res.status(201).json({ success: true, data: populatedTask });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const project = await Project.findById(task.project);

        // Check access: Admin, Owner, Assignee, or Reporter
        if (req.user.role !== 'admin' &&
            project.owner.toString() !== req.user.id &&
            task.assignee?.toString() !== req.user.id &&
            task.reporter?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .populate('labels', 'name color');

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const project = await Project.findById(task.project);

        // Check access: Admin or Owner
        if (req.user.role !== 'admin' &&
            project.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add watcher to task
// @route   POST /api/tasks/:id/watch
// @access  Private
exports.addWatcher = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (!task.watchers.includes(req.user.id)) {
            task.watchers.push(req.user.id);
            await task.save();
        }

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Remove watcher from task
// @route   DELETE /api/tasks/:id/watch
// @access  Private
exports.removeWatcher = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.watchers = task.watchers.filter(w => w.toString() !== req.user.id);
        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
