/**
 * routes/entranceAssessmentRoutes.js
 * Express routes for Student Entrance Assessment and Skill Verification.
 * All routes are guarded by JWT authentication.
 */

const express = require('express');
const router = express.Router();
const {
  getAssessmentStatus,
  getAssessmentQuestions,
  saveAssessmentProgress,
  submitAssessment,
  retakeSkillAssessment,
  verifySingleSkill
} = require('../controllers/entranceAssessmentController');
const { protect } = require('../middleware/authMiddleware');

// All entrance assessment routes require an authenticated student session
router.use(protect);

router.get('/status', getAssessmentStatus);
router.get('/questions', getAssessmentQuestions);
router.post('/progress', saveAssessmentProgress);
router.post('/submit', submitAssessment);
router.post('/verify/:skillName', verifySingleSkill);
router.post('/retake/:skillName', retakeSkillAssessment);

module.exports = router;
