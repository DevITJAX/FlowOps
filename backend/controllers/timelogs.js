const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');

// @desc    Get time logs for a task
// @route   GET /api/tasks/:taskId/timelogs
// @access  Private
exports.getTimeLogs = async (req, res, next) => {
    try {
        const timeLogs = await TimeLog.find({ task: req.params.taskId })
            .populate('user', 'name email')
            .sort({ loggedAt: -1 });

        const totalTime = timeLogs.reduce((sum, log) => sum + log.timeSpent, 0);

        res.status(200).json({
            success: true,
            count: timeLogs.length,
            totalTime,
            data: timeLogs
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Log time on a task
// @route   POST /api/tasks/:taskId/timelogs
// @access  Private
exports.logTime = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const timeLog = await TimeLog.create({
            task: req.params.taskId,
            user: req.user.id,
            timeSpent: req.body.timeSpent,
            description: req.body.description,
            loggedAt: req.body.loggedAt || Date.now()
        });

        // Update task's total time spent
        const allLogs = await TimeLog.find({ task: req.params.taskId });
        const totalTime = allLogs.reduce((sum, log) => sum + log.timeSpent, 0);

        await Task.findByIdAndUpdate(req.params.taskId, {
            timeSpent: totalTime,
            remainingEstimate: Math.max(0, task.originalEstimate - totalTime)
        });

        const populatedLog = await TimeLog.findById(timeLog._id).populate('user', 'name email');

        res.status(201).json({ success: true, data: populatedLog });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update time log
// @route   PUT /api/timelogs/:id
// @access  Private (owner only)
exports.updateTimeLog = async (req, res, next) => {
    try {
        let timeLog = await TimeLog.findById(req.params.id);

        if (!timeLog) {
            return res.status(404).json({ success: false, message: 'Time log not found' });
        }

        if (timeLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this time log' });
        }

        timeLog = await TimeLog.findByIdAndUpdate(
            req.params.id,
            { timeSpent: req.body.timeSpent, description: req.body.description },
            { new: true, runValidators: true }
        ).populate('user', 'name email');

        // Recalculate task total time
        const allLogs = await TimeLog.find({ task: timeLog.task });
        const totalTime = allLogs.reduce((sum, log) => sum + log.timeSpent, 0);
        const task = await Task.findById(timeLog.task);

        await Task.findByIdAndUpdate(timeLog.task, {
            timeSpent: totalTime,
            remainingEstimate: Math.max(0, task.originalEstimate - totalTime)
        });

        res.status(200).json({ success: true, data: timeLog });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete time log
// @route   DELETE /api/timelogs/:id
// @access  Private (owner or admin)
exports.deleteTimeLog = async (req, res, next) => {
    try {
        const timeLog = await TimeLog.findById(req.params.id);

        if (!timeLog) {
            return res.status(404).json({ success: false, message: 'Time log not found' });
        }

        if (timeLog.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this time log' });
        }

        const taskId = timeLog.task;
        await timeLog.deleteOne();

        // Recalculate task total time
        const allLogs = await TimeLog.find({ task: taskId });
        const totalTime = allLogs.reduce((sum, log) => sum + log.timeSpent, 0);
        const task = await Task.findById(taskId);

        await Task.findByIdAndUpdate(taskId, {
            timeSpent: totalTime,
            remainingEstimate: Math.max(0, task.originalEstimate - totalTime)
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
