const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/projects');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers
router.use('/:projectId/tasks', require('./tasks'));
router.use('/:projectId/labels', require('./labels'));
router.use('/:projectId/sprints', require('./sprints'));

router.use(protect);

router
    .route('/')
    .get(getProjects)
    .post(createProject);

router
    .route('/:id')
    .get(getProject)
    .put(updateProject)
    .delete(deleteProject);

module.exports = router;
