/**
 * routes/portfolioRoutes.js
 * Express routes for projects and certifications.
 */

const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  deleteProject,
  getCerts,
  createCert,
  deleteCert
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Projects
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.delete('/projects/:id', deleteProject);

// Certifications
router.get('/certifications', getCerts);
router.post('/certifications', createCert);
router.delete('/certifications/:id', deleteCert);

module.exports = router;
