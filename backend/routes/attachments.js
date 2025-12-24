const express = require('express');
const { getAttachments, uploadAttachment, downloadAttachment, deleteAttachment } = require('../controllers/attachments');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getAttachments)
    .post(upload.single('file'), uploadAttachment);

router.route('/:id')
    .delete(deleteAttachment);

router.get('/:id/download', downloadAttachment);

module.exports = router;
