const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Global search across tasks, projects, and users
// @route   GET /api/search
// @access  Private
exports.search = async (req, res, next) => {
    try {
        const { q, type, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const searchRegex = new RegExp(q, 'i');
        const results = { tasks: [], projects: [], users: [] };

        // Search by type or all
        const searchTypes = type ? [type] : ['tasks', 'projects', 'users'];

        if (searchTypes.includes('tasks')) {
            results.tasks = await Task.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { taskKey: searchRegex }
                ]
            })
                .select('title taskKey status priority type project')
                .populate('project', 'name key')
                .limit(parseInt(limit))
                .lean();
        }

        if (searchTypes.includes('projects')) {
            results.projects = await Project.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { key: searchRegex }
                ]
            })
                .select('name key description status')
                .limit(parseInt(limit))
                .lean();
        }

        if (searchTypes.includes('users')) {
            results.users = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            })
                .select('name email role')
                .limit(parseInt(limit))
                .lean();
        }

        // Calculate total results
        const total = results.tasks.length + results.projects.length + results.users.length;

        res.status(200).json({
            success: true,
            count: total,
            data: results
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
