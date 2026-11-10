/**
 * routes/portfolioRoutes.js
 * Express routes for projects and certifications.
 */

const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getCerts,
  createCert,
  updateCert,
  deleteCert,
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Projects
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Certifications
router.get('/certifications', getCerts);
router.post('/certifications', createCert);
router.put('/certifications/:id', updateCert);
router.delete('/certifications/:id', deleteCert);

// Achievements
router.get('/achievements', getAchievements);
router.post('/achievements', createAchievement);
router.put('/achievements/:id', updateAchievement);
router.delete('/achievements/:id', deleteAchievement);

module.exports = router;
