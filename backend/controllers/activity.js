const Activity = require('../models/Activity');

// @desc    Get recent activity
// @route   GET /api/activity
// @access  Private
exports.getRecentActivity = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'name email');

        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get activity by user
// @route   GET /api/activity/user/:userId
// @access  Private
exports.getActivityByUser = async (req, res, next) => {
    try {
        const activities = await Activity.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get activity by target
// @route   GET /api/activity/target/:targetType/:targetId
// @access  Private
exports.getActivityByTarget = async (req, res, next) => {
    try {
        const activities = await Activity.find({
            targetType: req.params.targetType,
            targetId: req.params.targetId
        })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
