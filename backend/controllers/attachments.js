const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');

// @desc    Get attachments for a task
// @route   GET /api/tasks/:taskId/attachments
// @access  Private
exports.getAttachments = async (req, res, next) => {
    try {
        const attachments = await Attachment.find({ task: req.params.taskId })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: attachments.length,
            data: attachments
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:taskId/attachments
// @access  Private
exports.uploadAttachment = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            // Delete uploaded file if task not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const attachment = await Attachment.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            task: req.params.taskId,
            uploadedBy: req.user.id
        });

        const populatedAttachment = await Attachment.findById(attachment._id)
            .populate('uploadedBy', 'name email');

        res.status(201).json({ success: true, data: populatedAttachment });
    } catch (err) {
        // Clean up file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Download attachment
// @route   GET /api/attachments/:id/download
// @access  Private
exports.downloadAttachment = async (req, res, next) => {
    try {
        const attachment = await Attachment.findById(req.params.id);

        if (!attachment) {
            return res.status(404).json({ success: false, message: 'Attachment not found' });
        }

        // Check if file exists
        if (!fs.existsSync(attachment.path)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        res.download(attachment.path, attachment.originalName);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
exports.deleteAttachment = async (req, res, next) => {
    try {
        const attachment = await Attachment.findById(req.params.id);

        if (!attachment) {
            return res.status(404).json({ success: false, message: 'Attachment not found' });
        }

        // Check if user is uploader or admin
        if (attachment.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this attachment' });
        }

        // Delete file from disk
        if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
        }

        await attachment.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
