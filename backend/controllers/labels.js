const Label = require('../models/Label');
const Project = require('../models/Project');

// @desc    Get labels for a project
// @route   GET /api/projects/:projectId/labels
// @access  Private
exports.getLabels = async (req, res, next) => {
    try {
        const labels = await Label.find({ project: req.params.projectId })
            .populate('createdBy', 'name')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: labels.length,
            data: labels
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create label
// @route   POST /api/projects/:projectId/labels
// @access  Private
exports.createLabel = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const label = await Label.create({
            name: req.body.name,
            color: req.body.color || '#6c757d',
            project: req.params.projectId,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: label });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Label with this name already exists in project' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update label
// @route   PUT /api/labels/:id
// @access  Private
exports.updateLabel = async (req, res, next) => {
    try {
        const label = await Label.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, color: req.body.color },
            { new: true, runValidators: true }
        );

        if (!label) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }

        res.status(200).json({ success: true, data: label });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete label
// @route   DELETE /api/labels/:id
// @access  Private
exports.deleteLabel = async (req, res, next) => {
    try {
        const label = await Label.findById(req.params.id);

        if (!label) {
            return res.status(404).json({ success: false, message: 'Label not found' });
        }

        await label.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
