const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects (where user is owner or member)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
    try {
        let query;

        // If admin, show all projects. Otherwise, show projects where user is owner or member
        if (req.user.role === 'admin') {
            query = Project.find().populate('owner', 'name email').populate('members', 'name email');
        } else {
            query = Project.find({
                $or: [
                    { owner: req.user.id },
                    { members: req.user.id }
                ]
            }).populate('owner', 'name email').populate('members', 'name email');
        }

        const projects = await query;

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email role')
            .populate('members', 'name email role');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if user has access
        if (req.user.role !== 'admin' &&
            project.owner._id.toString() !== req.user.id &&
            !project.members.some(m => m._id.toString() === req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this project' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
    try {
        req.body.owner = req.user.id;

        const project = await Project.create(req.body);
        const populated = await Project.findById(project._id)
            .populate('owner', 'name email')
            .populate('members', 'name email');

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Make sure user is project owner or admin
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('owner', 'name email').populate('members', 'name email');

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
        }

        await project.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
exports.getMembers = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email role')
            .populate('members', 'name email role');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const team = [
            { ...project.owner.toObject(), role: 'owner' },
            ...project.members.map(m => ({ ...m.toObject(), projectRole: 'member' }))
        ];

        res.status(200).json({
            success: true,
            count: team.length,
            data: team
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (owner or admin)
exports.addMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Only owner or admin can add members
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to add members' });
        }

        // Find user by email or ID
        let user;
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email });
        } else if (req.body.userId) {
            user = await User.findById(req.body.userId);
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if already a member or owner
        if (project.owner.toString() === user._id.toString()) {
            return res.status(400).json({ success: false, message: 'User is already the owner' });
        }

        if (project.members.includes(user._id)) {
            return res.status(400).json({ success: false, message: 'User is already a member' });
        }

        // Add member
        project.members.push(user._id);
        await project.save();

        const updated = await Project.findById(project._id)
            .populate('owner', 'name email')
            .populate('members', 'name email role');

        res.status(200).json({
            success: true,
            message: `${user.name} added to project`,
            data: updated
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (owner or admin)
exports.removeMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Only owner or admin can remove members
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to remove members' });
        }

        // Can't remove owner
        if (project.owner.toString() === req.params.userId) {
            return res.status(400).json({ success: false, message: 'Cannot remove the project owner' });
        }

        // Remove member
        project.members = project.members.filter(m => m.toString() !== req.params.userId);
        await project.save();

        const updated = await Project.findById(project._id)
            .populate('owner', 'name email')
            .populate('members', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Member removed from project',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get available users to add (not already in project)
// @route   GET /api/projects/:id/available-users
// @access  Private (owner or admin)
exports.getAvailableUsers = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Get all users except owner and current members
        const excludeIds = [project.owner, ...project.members];

        const users = await User.find({
            _id: { $nin: excludeIds },
            isActive: true
        }).select('name email role');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
