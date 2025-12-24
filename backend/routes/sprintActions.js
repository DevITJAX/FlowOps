const express = require('express');
const {
    getSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    moveTasksToSprint,
    removeTasksFromSprint
} = require('../controllers/sprints');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Single sprint routes (mounted at /api/sprints)
router.route('/:id').get(getSprint).put(updateSprint).delete(deleteSprint);

// Sprint lifecycle
router.put('/:id/start', startSprint);
router.put('/:id/complete', completeSprint);

// Sprint task management
router.post('/:id/tasks', moveTasksToSprint);
router.delete('/:id/tasks', removeTasksFromSprint);

module.exports = router;
