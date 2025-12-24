const express = require('express');
const { getTimeLogs, logTime, updateTimeLog, deleteTimeLog } = require('../controllers/timelogs');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getTimeLogs)
    .post(logTime);

router.route('/:id')
    .put(updateTimeLog)
    .delete(deleteTimeLog);

module.exports = router;
