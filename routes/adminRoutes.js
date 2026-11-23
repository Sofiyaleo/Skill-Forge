/**
 * routes/adminRoutes.js
 * Express routes for system administration.
 * All endpoints are strictly guarded by JWT authentication and adminOnly role checks.
 */

const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  getUserDetails,
  deleteUser,
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
  getAdminRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAdminAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAdminRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getAdminReports,
  getAdminProfile,
  updateAdminProfile,
  getAdminEntranceAssessments
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly); // Require verified admin privileges for all endpoints

// 1. Platform Statistics
router.get('/stats', getPlatformStats);

// 2. Student Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);

// 3. Skills Repository CRUD
router.get('/skills', getAdminSkills);
router.post('/skills', createAdminSkill);
router.put('/skills/:id', updateAdminSkill);
router.delete('/skills/:id', deleteAdminSkill);

// 4. Career Roles CRUD
router.get('/roles', getAdminRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// 5. Assessments & Questions CRUD
router.get('/assessments', getAdminAssessments);
router.get('/assessments/:id', getAssessmentById);
router.post('/assessments', createAssessment);
router.put('/assessments/:id', updateAssessment);
router.delete('/assessments/:id', deleteAssessment);

// 6. Learning Roadmaps CRUD
router.get('/roadmaps', getAdminRoadmaps);
router.get('/roadmaps/:id', getRoadmapById);
router.post('/roadmaps', createRoadmap);
router.put('/roadmaps/:id', updateRoadmap);
router.delete('/roadmaps/:id', deleteRoadmap);

// 7. Reports and Analytics
router.get('/reports', getAdminReports);

// 8. Admin Profile Management
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// 9. Entrance Assessment Oversight (Prompt Requirement 9)
router.get('/entrance-assessments', getAdminEntranceAssessments);

module.exports = router;
