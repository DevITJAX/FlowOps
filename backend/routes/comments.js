const express = require('express');
const { getComments, addComment, updateComment, deleteComment } = require('../controllers/comments');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getComments)
    .post(addComment);

router.route('/:id')
    .put(updateComment)
    .delete(deleteComment);

module.exports = router;
