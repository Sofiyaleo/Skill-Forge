/**
 * routes/careerRoutes.js
 * Express routes for Career Roles, Gap Analysis, and Roadmaps.
 */

const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  analyzeSkillGap,
  getRoadmap,
  toggleRoadmapTask
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllRoles);
router.get('/gap-analysis', protect, analyzeSkillGap);
router.get('/roadmap', protect, getRoadmap);
router.post('/roadmap/toggle-task', protect, toggleRoadmapTask);
router.get('/:id', getRoleById);

module.exports = router;
