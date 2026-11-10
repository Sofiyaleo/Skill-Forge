/**
 * routes/resumeRoutes.js
 * Express routes for resume data retrieval.
 */

const express = require('express');
const router = express.Router();
const { getResumeData } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/data', protect, getResumeData);

module.exports = router;
