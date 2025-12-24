const express = require('express');
const {
    getRecentActivity,
    getActivityByUser,
    getActivityByTarget
} = require('../controllers/activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getRecentActivity);
router.get('/user/:userId', getActivityByUser);
router.get('/target/:targetType/:targetId', getActivityByTarget);

module.exports = router;
