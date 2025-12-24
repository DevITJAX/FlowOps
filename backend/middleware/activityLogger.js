const Activity = require('../models/Activity');

const logActivity = async (action, userId, targetType, targetId, details = {}) => {
    try {
        await Activity.create({
            action,
            user: userId,
            targetType,
            targetId,
            details
        });
    } catch (err) {
        console.error(`Activity logging failed: ${err.message}`);
    }
};

module.exports = logActivity;
