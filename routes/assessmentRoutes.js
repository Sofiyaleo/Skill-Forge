/**
 * routes/assessmentRoutes.js
 * Express routes for Assessments and MCQ Quiz Runner.
 */

const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyResults
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Require authentication for tests

router.get('/', getAssessments);
router.get('/my-results', getMyResults);
router.get('/:id', getAssessmentById);
router.post('/:id/submit', submitAssessment);

module.exports = router;
