/**
 * controllers/studentController.js
 * Handles student dashboard metrics, profile management, and skills CRUD.
 */

const User = require('../models/User');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Application = require('../models/Application');
const AssessmentResult = require('../models/AssessmentResult');
const Activity = require('../models/Activity');
const CareerRole = require('../models/CareerRole');

/**
 * @desc    Get dashboard metrics, progress gauge, and recent activities
 * @route   GET /api/student/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Fetch counts
    const skillsCount = user.skills ? user.skills.length : 0;
    const assessmentsCount = await AssessmentResult.countDocuments({ user: userId });
    const projectsCount = await Project.countDocuments({ user: userId });
    const applicationsCount = await Application.countDocuments({ user: userId });

    // 2. Fetch Recent Activities
    let activities = await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(5);

    // If no activities yet, provide default starter activities
    if (activities.length === 0) {
      activities = [
        { text: 'Created your SkillForge student account', color: '#6366F1', createdAt: user.createdAt || new Date() }
      ];
    }

    // Format relative time for activities
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} mins ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      return `${Math.floor(seconds / 86400)} days ago`;
    };

    const formattedActivities = activities.map(act => ({
      id: act._id,
      text: act.text,
      icon: act.icon || 'bi-check-circle',
      color: act.color || '#6366F1',
      timeAgo: formatTimeAgo(act.createdAt)
    }));

    // 3. Calculate Overall Progress
    // Calculate readiness against target role or fallback to 68%
    let overallProgress = 68;
    const targetRole = await CareerRole.findOne({ title: user.careerInterest || 'Web Developer' });
    if (targetRole && targetRole.requiredSkills.length > 0) {
      let matchedScore = 0;
      let totalRequiredScore = 0;

      targetRole.requiredSkills.forEach(reqSkill => {
        const reqWeight = reqSkill.requiredLevel;
        totalRequiredScore += reqWeight;
        const studentSkill = user.skills.find(s => s.name.toLowerCase() === reqSkill.name.toLowerCase());
        if (studentSkill) {
          matchedScore += Math.min(studentSkill.rating, reqWeight);
        }
      });

      if (totalRequiredScore > 0) {
        overallProgress = Math.round((matchedScore / totalRequiredScore) * 100);
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        skills: { count: skillsCount, delta: '+2 this month' },
        assessments: { count: assessmentsCount, delta: '+1 this month' },
        projects: { count: projectsCount, delta: '+1 this month' },
        internships: { count: applicationsCount, delta: '+0 this month' },
        overallProgress
      },
      recentActivities: formattedActivities
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
};

/**
 * @desc    Get user profile details & skills list
 * @route   GET /api/student/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
};

/**
 * @desc    Update user profile fields
 * @route   PUT /api/student/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, education, careerInterest, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (education) user.education = education;
    if (careerInterest) user.careerInterest = careerInterest;
    if (bio) user.bio = bio;

    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      text: 'Updated your profile',
      icon: 'bi-person-check',
      color: '#F59E0B'
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * @desc    Add a new skill to student profile
 * @route   POST /api/student/skills
 * @access  Private
 */
exports.addSkill = async (req, res) => {
  try {
    const { name, category, rating } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const user = await User.findById(req.user.id);
    const existingIndex = user.skills.findIndex(s => s.name.toLowerCase() === name.trim().toLowerCase());

    if (existingIndex !== -1) {
      // Update rating if already exists
      user.skills[existingIndex].rating = Number(rating) || 3;
      user.skills[existingIndex].category = category || user.skills[existingIndex].category;
    } else {
      user.skills.push({
        name: name.trim(),
        category: category || 'Frontend',
        rating: Number(rating) || 3,
        isVerified: false
      });
    }

    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      text: `Added skill '${name.trim()}' (Level ${rating || 3}/5)`,
      icon: 'bi-award',
      color: '#6366F1'
    });

    res.status(200).json({
      success: true,
      message: 'Skill saved successfully.',
      skills: user.skills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add skill.' });
  }
};

/**
 * @desc    Delete a skill from student profile
 * @route   DELETE /api/student/skills/:skillId
 * @access  Private
 */
exports.deleteSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.skills = user.skills.filter(s => s._id.toString() !== req.params.skillId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully.',
      skills: user.skills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
};
