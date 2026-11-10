/**
 * controllers/adminController.js
 * Administrative control panel logic:
 * - Platform analytics & KPIs
 * - User management
 * - Career Role catalog administration
 * - Assessment & Quiz administration
 */

const User = require('../models/User');
const CareerRole = require('../models/CareerRole');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Application = require('../models/Application');

/**
 * @desc    Get system-wide platform statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin Only)
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRoles = await CareerRole.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalTestsTaken = await AssessmentResult.countDocuments();
    const totalApplications = await Application.countDocuments();

    const recentStudents = await User.find({ role: 'student' })
      .select('name email careerInterest createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRoles,
        totalAssessments,
        totalTestsTaken,
        totalApplications
      },
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: `User '${user.name}' removed successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

/**
 * @desc    Create a new Career Role
 * @route   POST /api/admin/roles
 * @access  Private (Admin Only)
 */
exports.createRole = async (req, res) => {
  try {
    const { title, category, description, requiredSkills, averageSalary } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : [];

    const role = await CareerRole.create({
      title: title.trim(),
      category: category || 'Tech',
      description: description.trim(),
      averageSalary: averageSalary || '₹6 - 12 LPA',
      requiredSkills: skillsArray,
      roadmapSteps: [
        {
          stepOrder: 1,
          weekTitle: 'Week 1-2: Core Foundations',
          tasks: [
            { taskId: `task-${Date.now()}-1`, title: 'Study fundamental concepts & tooling', defaultStatus: 'To Do' }
          ]
        }
      ]
    });

    res.status(201).json({ success: true, message: 'Career role created successfully.', role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create role.' });
  }
};

/**
 * @desc    Delete Career Role
 * @route   DELETE /api/admin/roles/:id
 * @access  Private (Admin Only)
 */
exports.deleteRole = async (req, res) => {
  try {
    const role = await CareerRole.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.status(200).json({ success: true, message: 'Career role deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete role.' });
  }
};
