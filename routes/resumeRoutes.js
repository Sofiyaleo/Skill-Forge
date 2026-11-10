/**
 * routes/resumeRoutes.js
 * Express routes for resume data retrieval and settings.
 */

const express = require('express');
const router = express.Router();
const { getResumeData, saveResumeSettings } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/data', getResumeData);
router.put('/settings', saveResumeSettings);

module.exports = router;
