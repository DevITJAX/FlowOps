const express = require('express');
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/tasks');
const { protect } = require('../middleware/auth');

// Need mergeParams: true to access projectId from project router
const router = express.Router({ mergeParams: true });

// Re-route nested resources
router.use('/:taskId/comments', require('./comments'));
router.use('/:taskId/timelogs', require('./timelogs'));

router.use(protect);

router
    .route('/')
    .get(getTasks)
    .post(createTask);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;
