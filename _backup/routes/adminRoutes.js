/**
 * routes/adminRoutes.js
 * Express routes for system administration. Protected by JWT and adminOnly guard.
 */

const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  deleteUser,
  createRole,
  deleteRole
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly); // Require admin privileges for all endpoints

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/roles', createRole);
router.delete('/roles/:id', deleteRole);

module.exports = router;
