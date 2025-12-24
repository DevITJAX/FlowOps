const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getMembers,
    addMember,
    removeMember,
    getAvailableUsers
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

// Team member management
router.get('/:id/members', getMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/available-users', getAvailableUsers);

module.exports = router;
