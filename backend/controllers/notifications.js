const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';

        const query = { user: req.user.id };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('relatedTask', 'title taskKey')
            .populate('relatedProject', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await notification.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear
// @access  Private
exports.clearReadNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({
            user: req.user.id,
            isRead: true
        });

        res.status(200).json({ success: true, message: 'Read notifications cleared' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Helper function to create notifications (used by other parts of the app)
exports.createNotification = async (userId, type, title, message, options = {}) => {
    try {
        await Notification.create({
            user: userId,
            type,
            title,
            message,
            link: options.link,
            relatedTask: options.taskId,
            relatedProject: options.projectId
        });
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
};
