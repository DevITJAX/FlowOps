const express = require('express');
const {
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    updateMemberRole,
    getAvailableUsers
} = require('../controllers/teams');
const { protect } = require('../middleware/auth');

// For project-scoped routes: /api/projects/:projectId/teams
const projectRouter = express.Router({ mergeParams: true });
projectRouter.use(protect);
projectRouter.route('/').get(getTeams).post(createTeam);

// For team-specific routes: /api/teams
const teamRouter = express.Router();
teamRouter.use(protect);

teamRouter.route('/:id')
    .get(getTeam)
    .put(updateTeam)
    .delete(deleteTeam);

teamRouter.get('/:id/available-users', getAvailableUsers);

teamRouter.route('/:id/members')
    .post(addMember);

teamRouter.route('/:id/members/:userId')
    .put(updateMemberRole)
    .delete(removeMember);

module.exports = { projectRouter, teamRouter };
