const express = require('express');
const { getLabels, createLabel, updateLabel, deleteLabel } = require('../controllers/labels');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getLabels)
    .post(createLabel);

router.route('/:id')
    .put(updateLabel)
    .delete(deleteLabel);

module.exports = router;
