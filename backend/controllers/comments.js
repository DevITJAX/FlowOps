const Comment = require('../models/Comment');
const Task = require('../models/Task');

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ task: req.params.taskId })
            .populate('author', 'name email')
            .populate('mentions', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Extract @mentions from content
        const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(req.body.content)) !== null) {
            mentions.push(match[2]); // User ID from mention
        }

        const comment = await Comment.create({
            content: req.body.content,
            task: req.params.taskId,
            author: req.user.id,
            mentions
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name email')
            .populate('mentions', 'name email');

        res.status(201).json({ success: true, data: populatedComment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
exports.updateComment = async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Only author can edit
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' });
        }

        comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content, isEdited: true, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        res.status(200).json({ success: true, data: comment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (author or admin)
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
