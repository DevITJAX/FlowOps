const IssueLink = require('../models/IssueLink');
const Task = require('../models/Task');

// @desc    Get links for a task
// @route   GET /api/tasks/:taskId/links
// @access  Private
exports.getLinks = async (req, res, next) => {
    try {
        // Get outgoing links (where this task is the source)
        const outgoingLinks = await IssueLink.find({ sourceTask: req.params.taskId })
            .populate('targetTask', 'title taskKey status type')
            .populate('createdBy', 'name');

        // Get incoming links (where this task is the target)
        const incomingLinks = await IssueLink.find({ targetTask: req.params.taskId })
            .populate('sourceTask', 'title taskKey status type')
            .populate('createdBy', 'name');

        // Transform incoming links to show the reverse relationship
        const transformedIncoming = incomingLinks.map(link => ({
            _id: link._id,
            linkType: IssueLink.getReverseLinkType(link.linkType),
            linkedTask: link.sourceTask,
            createdBy: link.createdBy,
            createdAt: link.createdAt,
            direction: 'incoming'
        }));

        const transformedOutgoing = outgoingLinks.map(link => ({
            _id: link._id,
            linkType: link.linkType,
            linkedTask: link.targetTask,
            createdBy: link.createdBy,
            createdAt: link.createdAt,
            direction: 'outgoing'
        }));

        const allLinks = [...transformedOutgoing, ...transformedIncoming];

        res.status(200).json({
            success: true,
            count: allLinks.length,
            data: allLinks
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a link between tasks
// @route   POST /api/tasks/:taskId/links
// @access  Private
exports.createLink = async (req, res, next) => {
    try {
        const sourceTask = await Task.findById(req.params.taskId);
        if (!sourceTask) {
            return res.status(404).json({ success: false, message: 'Source task not found' });
        }

        const targetTask = await Task.findById(req.body.targetTaskId);
        if (!targetTask) {
            return res.status(404).json({ success: false, message: 'Target task not found' });
        }

        // Prevent self-linking
        if (req.params.taskId === req.body.targetTaskId) {
            return res.status(400).json({ success: false, message: 'Cannot link a task to itself' });
        }

        const link = await IssueLink.create({
            linkType: req.body.linkType,
            sourceTask: req.params.taskId,
            targetTask: req.body.targetTaskId,
            createdBy: req.user.id
        });

        const populatedLink = await IssueLink.findById(link._id)
            .populate('targetTask', 'title taskKey status type')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            data: {
                _id: populatedLink._id,
                linkType: populatedLink.linkType,
                linkedTask: populatedLink.targetTask,
                createdBy: populatedLink.createdBy,
                createdAt: populatedLink.createdAt,
                direction: 'outgoing'
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'This link already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a link
// @route   DELETE /api/links/:id
// @access  Private
exports.deleteLink = async (req, res, next) => {
    try {
        const link = await IssueLink.findById(req.params.id);

        if (!link) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        await link.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
