/**
 * routes/studentRoutes.js
 * Express routes for student dashboard metrics, profile, and skill management.
 */

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProfile,
  updateProfile,
  updateTargetCareer,
  getSkills,
  getAvailableSkills,
  addSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All student routes require authentication

router.get('/dashboard', getDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/target-career', updateTargetCareer);

router.get('/skills/available', getAvailableSkills);
router.get('/skills', getSkills);
router.post('/skills', addSkill);
router.put('/skills/:skillId', updateSkill);
router.delete('/skills/:skillId', deleteSkill);

module.exports = router;
