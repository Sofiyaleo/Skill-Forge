/**
 * controllers/resumeController.js
 * Aggregates complete student portfolio data (profile, skills, projects,
 * education, certifications) for dynamic ATS-friendly resume generation.
 */

const User = require('../models/User');
const Project = require('../models/Project');
const Certification = require('../models/Certification');

/**
 * @desc    Get aggregated student data for Resume Builder
 * @route   GET /api/resume/data
 * @access  Private
 */
exports.getResumeData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    const certifications = await Certification.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      resume: {
        personalInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+91 98765 43210',
          location: user.location || 'Bangalore, India',
          careerInterest: user.careerInterest || 'Web Developer',
          bio: user.bio || 'Passionate student dedicated to web development and technology.'
        },
        education: user.education || 'B.Tech / MCA in Computer Science - ABC College',
        skills: user.skills || [],
        projects: projects || [],
        certifications: certifications || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compile resume data.' });
  }
};
