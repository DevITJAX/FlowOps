const express = require('express');
const { search } = require('../controllers/search');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search across tasks, projects, and users
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (min 2 characters)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tasks, projects, users]
 *         description: Filter by result type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Max results per type
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Query too short
 */
router.get('/', protect, search);

module.exports = router;
