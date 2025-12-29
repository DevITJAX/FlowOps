const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all teams for a project
// @route   GET /api/projects/:projectId/teams
// @access  Private
exports.getTeams = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const teams = await Team.find({ project: req.params.projectId })
            .populate('lead', 'name email')
            .populate('members.user', 'name email')
            .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            count: teams.length,
            data: teams
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single team with members
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('lead', 'name email')
            .populate('members.user', 'name email')
            .populate('project', 'name key')
            .populate('createdBy', 'name');

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.status(200).json({ success: true, data: team });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create team
// @route   POST /api/projects/:projectId/teams
// @access  Private
exports.createTeam = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if user is owner or admin
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to create teams' });
        }

        const team = await Team.create({
            name: req.body.name,
            description: req.body.description,
            project: req.params.projectId,
            color: req.body.color || '#6366f1',
            lead: req.body.lead,
            members: req.body.members || [],
            isDefault: req.body.isDefault || false,
            createdBy: req.user.id
        });

        const populated = await Team.findById(team._id)
            .populate('lead', 'name email')
            .populate('members.user', 'name email')
            .populate('createdBy', 'name');

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res, next) => {
    try {
        let team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Check if user is owner, admin, or team lead
        if (project.owner.toString() !== req.user.id &&
            req.user.role !== 'admin' &&
            team.lead?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update team' });
        }

        // Only allow updating certain fields
        const allowedUpdates = ['name', 'description', 'color', 'lead', 'isDefault'];
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        team = await Team.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        })
            .populate('lead', 'name email')
            .populate('members.user', 'name email');

        res.status(200).json({ success: true, data: team });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Only owner or admin can delete teams
        if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete team' });
        }

        // Don't allow deleting default team
        if (team.isDefault) {
            return res.status(400).json({ success: false, message: 'Cannot delete default team' });
        }

        await team.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
exports.addMember = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Check authorization
        if (project.owner.toString() !== req.user.id &&
            req.user.role !== 'admin' &&
            team.lead?.toString() !== req.user.id) {
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

        // Check if already a member
        const isMember = team.members.some(m => m.user.toString() === user._id.toString());
        if (isMember) {
            return res.status(400).json({ success: false, message: 'User is already a team member' });
        }

        // Add member
        team.members.push({
            user: user._id,
            role: req.body.role || 'member'
        });
        await team.save();

        // Also add to project members if not already
        if (!project.members.includes(user._id) && project.owner.toString() !== user._id.toString()) {
            project.members.push(user._id);
            await project.save();
        }

        const updated = await Team.findById(team._id)
            .populate('lead', 'name email')
            .populate('members.user', 'name email');

        res.status(200).json({
            success: true,
            message: `${user.name} added to team`,
            data: updated
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Check authorization
        if (project.owner.toString() !== req.user.id &&
            req.user.role !== 'admin' &&
            team.lead?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to remove members' });
        }

        // Can't remove team lead through this endpoint
        if (team.lead?.toString() === req.params.userId) {
            return res.status(400).json({ success: false, message: 'Cannot remove team lead. Assign a new lead first.' });
        }

        // Remove member
        team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
        await team.save();

        const updated = await Team.findById(team._id)
            .populate('lead', 'name email')
            .populate('members.user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Member removed from team',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update member role in team
// @route   PUT /api/teams/:id/members/:userId
// @access  Private
exports.updateMemberRole = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Check authorization
        if (project.owner.toString() !== req.user.id &&
            req.user.role !== 'admin' &&
            team.lead?.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update roles' });
        }

        // Find and update member role
        const memberIndex = team.members.findIndex(m => m.user.toString() === req.params.userId);
        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Member not found in team' });
        }

        team.members[memberIndex].role = req.body.role;
        await team.save();

        const updated = await Team.findById(team._id)
            .populate('lead', 'name email')
            .populate('members.user', 'name email');

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get users available to add to team
// @route   GET /api/teams/:id/available-users
// @access  Private
exports.getAvailableUsers = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const project = await Project.findById(team.project);

        // Get IDs of current team members and lead
        const teamMemberIds = team.members.map(m => m.user);
        if (team.lead) {
            teamMemberIds.push(team.lead);
        }

        // Get project members who are not in this team
        const availableUsers = await User.find({
            _id: {
                $in: [project.owner, ...project.members],
                $nin: teamMemberIds
            },
            isActive: true
        }).select('name email role');

        res.status(200).json({
            success: true,
            count: availableUsers.length,
            data: availableUsers
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
