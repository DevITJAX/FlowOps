const express = require('express');
const { getLinks, createLink, deleteLink } = require('../controllers/issueLinks');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getLinks)
    .post(createLink);

router.route('/:id')
    .delete(deleteLink);

module.exports = router;
