/**
 * controllers/resumeController.js
 * Aggregates complete student portfolio data (profile, academic info, skills, projects,
 * certifications, achievements) for dynamic ATS-friendly resume generation.
 */

const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

/**
 * @desc    Get aggregated student data for Resume Builder
 * @route   GET /api/resume/data
 * @access  Private
 */
exports.getResumeData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    const certifications = await Certification.find({ user: req.user.id }).sort({ createdAt: -1 });
    const achievements = await Achievement.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Collect skills from both Skill collection and user.skills
    const dbSkills = await Skill.find({ user: req.user.id });
    const userEmbedded = user.skills || [];
    const skillMap = new Map();
    userEmbedded.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    dbSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    const mergedSkills = Array.from(skillMap.values());

    // Education string construction
    let educationDisplay = user.education || '';
    if (!educationDisplay && (user.degree || user.college)) {
      const parts = [];
      if (user.degree) parts.push(user.degree);
      if (user.department) parts.push(`in ${user.department}`);
      if (user.college) parts.push(`- ${user.college}`);
      educationDisplay = parts.join(' ');
    }

    res.status(200).json({
      success: true,
      resume: {
        personalInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone || '+91 98765 43210',
          location: user.location || 'Bangalore, India',
          targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
          careerInterest: user.careerInterest || user.targetCareer || 'Full Stack Developer',
          bio: user.bio || user.professionalSummary || 'Motivated computer science student dedicated to modern software engineering.',
          professionalSummary: user.professionalSummary || user.bio || 'Motivated computer science student dedicated to modern software engineering.',
          linkedinUrl: user.linkedinUrl || '',
          githubUrl: user.githubUrl || '',
          portfolioUrl: user.portfolioUrl || '',
          graduationYear: user.graduationYear || '',
          resumeTemplate: user.resumeTemplate || 'modern'
        },
        academic: {
          college: user.college || '',
          degree: user.degree || '',
          department: user.department || '',
          academicYear: user.academicYear || '',
          educationalBackground: user.educationalBackground || '',
          graduationYear: user.graduationYear || '',
          education: educationDisplay || 'Degree in Computer Science & Engineering'
        },
        education: educationDisplay || 'Degree in Computer Science & Engineering',
        skills: mergedSkills,
        projects,
        certifications,
        achievements
      }
    });
  } catch (error) {
    console.error('Resume Data Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compile resume data.' });
  }
};

/**
 * @desc    Save customized resume settings & details
 * @route   PUT /api/resume/settings
 * @access  Private
 */
exports.saveResumeSettings = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      professionalSummary,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      graduationYear,
      resumeTemplate
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (professionalSummary !== undefined) {
      user.professionalSummary = professionalSummary.trim();
      user.bio = professionalSummary.trim();
    }
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (graduationYear !== undefined) user.graduationYear = graduationYear.trim();
    if (resumeTemplate !== undefined && ['modern', 'minimal', 'classic'].includes(resumeTemplate)) {
      user.resumeTemplate = resumeTemplate;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume profile settings saved successfully.',
      user
    });
  } catch (error) {
    console.error('Save Resume Settings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to save resume settings.' });
  }
};
