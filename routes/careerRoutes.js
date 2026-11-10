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
  generateRoadmap,
  toggleRoadmapTask,
  selectTargetCareer
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllRoles);
router.get('/available-skills', async (req, res) => {
  try {
    const GlobalSkill = require('../models/GlobalSkill');
    const skills = await GlobalSkill.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve available skills.' });
  }
});
router.get('/gap-analysis', protect, analyzeSkillGap);
router.get('/roadmap', protect, getRoadmap);
router.post('/roadmap/generate', protect, generateRoadmap);
router.post('/roadmap/toggle-task', protect, toggleRoadmapTask);
router.post('/select-target', protect, selectTargetCareer);
router.get('/:id', getRoleById);

module.exports = router;
