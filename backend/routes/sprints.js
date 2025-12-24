const express = require('express');
const {
    getSprints,
    getSprint,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    getBacklog,
    moveTasksToSprint,
    removeTasksFromSprint,
    getVelocity
} = require('../controllers/sprints');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Project-scoped routes (mounted at /api/projects/:projectId/sprints)
router.route('/').get(getSprints).post(createSprint);

// Backlog and velocity (mounted at /api/projects/:projectId/)
router.get('/backlog', getBacklog);
router.get('/velocity', getVelocity);

module.exports = router;
