/**
 * controllers/studentController.js
 * Handles student dashboard metrics, profile management, and skills CRUD.
 * Calculates all statistics strictly from actual MongoDB records.
 */

const User = require('../models/User');
const GlobalSkill = require('../models/GlobalSkill');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const AssessmentResult = require('../models/AssessmentResult');
const Activity = require('../models/Activity');
const CareerRole = require('../models/CareerRole');
const RoadmapTask = require('../models/RoadmapTask');
const Achievement = require('../models/Achievement');
const { getCareerById, careers } = require('../data/careers');
const { calculateSkillGap } = require('../services/skillGapService');
const { generateUserRoadmap } = require('../services/roadmapService');
const { normalizeSkillKey } = require('../data/entranceQuestions');

/**
 * @desc    Get dashboard metrics, progress gauge, and recent activities
 * @route   GET /api/student/dashboard
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    // 1. Fetch real student skills
    const dbSkills = await Skill.find({ user: userId });
    const userEmbeddedSkills = user.skills || [];
    const skillMap = new Map();
    userEmbeddedSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    dbSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    const allStudentSkills = Array.from(skillMap.values());

    const skillsCount = allStudentSkills.length;
    const assessmentsCount = await AssessmentResult.countDocuments({ user: userId });
    const projectsCount = await Project.countDocuments({ user: userId });
    const certificationsCount = await Certification.countDocuments({ user: userId });
    const achievementsCount = await Achievement.countDocuments({ user: userId });

    // 2. Fetch Roadmap Breakdown
    const totalRoadmapTasks = await RoadmapTask.countDocuments({ user: userId });
    const completedRoadmapTasks = await RoadmapTask.countDocuments({ user: userId, status: 'Completed' });
    const inProgressRoadmapTasks = await RoadmapTask.countDocuments({ user: userId, status: 'In Progress' });
    const notStartedRoadmapTasks = await RoadmapTask.countDocuments({ user: userId, status: 'Not Started' });
    const roadmapCompletion = totalRoadmapTasks > 0
      ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100)
      : 0;

    // 3. Compute Real Career Readiness & Gap Analysis
    const targetRoleTitle = user.targetCareer || user.careerInterest || 'Full Stack Developer';
    const career = getCareerById(targetRoleTitle) || careers[0];
    const gap = calculateSkillGap(career, allStudentSkills);

    // 4. Fetch Recent Assessment Results for Performance Chart & Verified Skills
    const allUserAssessments = await AssessmentResult.find({ user: userId }).sort({ createdAt: -1 });
    const recentAssessments = allUserAssessments.slice(0, 6);
    
    const avgScore = recentAssessments.length > 0
      ? Math.round(recentAssessments.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / recentAssessments.length)
      : 0;

    // Build My Skill Levels Breakdown (Skill name, score out of 5, identified level, completion status)
    const mySkillLevels = [];
    const verifiedSkillsList = [];
    const notVerifiedSkillsList = [];
    const unassessedSkillsList = [];

    allStudentSkills.forEach(s => {
      const sName = s.name.trim();
      const sNorm = normalizeSkillKey(s.normalizedName || sName);
      const matchingRes = allUserAssessments.find(a => {
        const aNorm = normalizeSkillKey(a.skillName || a.topic || a.assessmentTitle);
        return aNorm === sNorm || (a.skillName && a.skillName.toLowerCase() === s.name.toLowerCase());
      });

      const scorePct = matchingRes ? matchingRes.percentage : (s.verificationScore || 0);
      const isVer = Boolean(s.isVerified || (matchingRes && matchingRes.passed));
      const score = matchingRes ? matchingRes.score : (s.verificationScore ? Math.round((s.verificationScore / 100) * 5) : null);
      const identifiedLevel = matchingRes
        ? (matchingRes.identifiedLevel || (matchingRes.passed ? (matchingRes.score >= 4 ? 'Advanced' : 'Intermediate') : 'Beginner'))
        : (s.proficiency && s.proficiency !== 'Unassessed' ? s.proficiency : 'Unassessed');
      const completionStatus = matchingRes ? 'Completed' : (s.isVerified ? 'Completed' : 'Unassessed');

      mySkillLevels.push({
        name: sName,
        category: s.category || 'General',
        score: score,
        totalQuestions: matchingRes ? matchingRes.totalQuestions : 5,
        scoreText: score !== null ? `${score}/5` : 'Unassessed',
        percentage: scorePct,
        identifiedLevel,
        isVerified: isVer,
        completionStatus,
        assessmentDate: matchingRes ? matchingRes.createdAt : (s.verificationDate || null),
        canRetake: !isVer || identifiedLevel !== 'Advanced'
      });

      if (isVer) {
        verifiedSkillsList.push({
          name: sName,
          category: s.category || 'General',
          percentage: scorePct || 80,
          score: score,
          scoreText: score !== null ? `${score}/5` : 'Verified',
          identifiedLevel,
          isVerified: true
        });
      } else if (matchingRes) {
        notVerifiedSkillsList.push({
          name: sName,
          category: s.category || 'General',
          percentage: scorePct,
          score: score,
          scoreText: score !== null ? `${score}/5` : '0/5',
          identifiedLevel,
          isVerified: false,
          canRetake: true
        });
      } else {
        unassessedSkillsList.push({
          name: sName,
          category: s.category || 'General',
          identifiedLevel: 'Unassessed',
          score: null,
          scoreText: 'Unassessed',
          isVerified: false,
          canRetake: false
        });
      }
    });

    // 5. Fetch Recent Showcase Items
    const recentProjects = await Project.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentCertifications = await Certification.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
    const recentAchievements = await Achievement.find({ user: userId }).sort({ createdAt: -1 }).limit(3);

    // 6. Fetch Recent Activities for this student
    let activities = await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(6);

    if (activities.length === 0) {
      activities = [
        {
          text: 'Welcome to SkillForge! Your career dashboard is ready.',
          icon: 'bi-stars',
          color: '#059669',
          createdAt: user.createdAt || new Date()
        }
      ];
    }

    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} mins ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      return `${Math.floor(seconds / 86400)} days ago`;
    };

    const formattedActivities = activities.map(act => ({
      id: act._id,
      text: act.text,
      icon: act.icon || 'bi-check-circle',
      color: act.color || '#059669',
      timeAgo: formatTimeAgo(act.createdAt)
    }));

    res.status(200).json({
      success: true,
      stats: {
        studentName: user.name,
        targetCareer: targetRoleTitle,
        college: user.college || '',
        degree: user.degree || '',
        skills: { count: skillsCount },
        assessments: {
          count: assessmentsCount,
          averageScore: avgScore
        },
        projects: { count: projectsCount },
        certifications: { count: certificationsCount },
        achievements: { count: achievementsCount },
        roadmap: {
          total: totalRoadmapTasks,
          completed: completedRoadmapTasks,
          inProgress: inProgressRoadmapTasks,
          notStarted: notStartedRoadmapTasks,
          percentage: roadmapCompletion
        },
        readiness: {
          percentage: gap.matchPercentage,
          matchedCount: gap.matchedCount,
          needsImprovementCount: gap.needsImprovementCount,
          missingCount: gap.missingCount,
          totalRequired: gap.totalRequired
        }
      },
      skillsList: allStudentSkills.map(s => ({
        name: s.name,
        category: s.category || 'General',
        proficiency: s.proficiency || 'Unassessed',
        rating: s.rating || (s.proficiency === 'Expert' ? 5 : s.proficiency === 'Advanced' ? 4 : s.proficiency === 'Intermediate' ? 3 : s.proficiency === 'Basic' ? 2 : 1)
      })),
      roadmapBreakdown: {
        completed: completedRoadmapTasks,
        inProgress: inProgressRoadmapTasks,
        notStarted: notStartedRoadmapTasks,
        total: totalRoadmapTasks
      },
      assessmentHistory: recentAssessments.map(a => ({
        topic: a.topic || a.assessmentTitle,
        title: a.assessmentTitle || a.topic,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        passed: a.passed,
        date: new Date(a.createdAt).toLocaleDateString()
      })),
      recentProjects,
      recentCertifications,
      recentAchievements,
      gapAnalysis: {
        matchedSkills: gap.matchedSkills,
        needsImprovementSkills: gap.needsImprovementSkills,
        missingSkills: gap.missingSkills,
        suggestedNextSteps: gap.suggestedNextSteps
      },
      verifiedSkillsSection: {
        targetCareer: targetRoleTitle,
        entranceCompleted: Boolean(user.entranceAssessmentCompleted),
        entranceSummary: user.entranceAssessmentSummary || null,
        mySkillLevels,
        verifiedSkills: verifiedSkillsList,
        notVerifiedSkills: notVerifiedSkillsList,
        unassessedSkills: unassessedSkillsList,
        history: allUserAssessments.slice(0, 8).map(a => ({
          title: a.skillName || a.assessmentTitle || a.topic,
          score: a.score,
          totalQuestions: a.totalQuestions,
          percentage: a.percentage,
          identifiedLevel: a.identifiedLevel || (a.passed ? 'Intermediate' : 'Beginner'),
          passed: a.passed,
          verificationStatus: a.verificationStatus || (a.passed ? 'VERIFIED' : 'NOT VERIFIED'),
          type: a.type || 'regular',
          attemptNumber: a.attemptNumber || 1,
          date: new Date(a.createdAt).toLocaleDateString()
        }))
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
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const dbSkills = await Skill.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      profile: user,
      skills: dbSkills.length > 0 ? dbSkills : user.skills || []
    });
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
    const {
      name,
      phone,
      location,
      college,
      degree,
      department,
      academicYear,
      educationalBackground,
      targetCareer,
      careerInterest,
      bio,
      professionalSummary
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (college !== undefined) user.college = college.trim();
    if (degree !== undefined) user.degree = degree.trim();
    if (department !== undefined) user.department = department.trim();
    if (academicYear !== undefined) user.academicYear = academicYear.trim();
    if (educationalBackground !== undefined) user.educationalBackground = educationalBackground.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (professionalSummary !== undefined) user.professionalSummary = professionalSummary.trim();

    const previousCareer = user.targetCareer;
    if (targetCareer) {
      user.targetCareer = targetCareer.trim();
      user.careerInterest = targetCareer.trim();
    } else if (careerInterest) {
      user.targetCareer = careerInterest.trim();
      user.careerInterest = careerInterest.trim();
    }

    await user.save();

    // If target career changed, refresh roadmap recommendations
    if (targetCareer && targetCareer.trim() !== previousCareer) {
      try {
        await generateUserRoadmap(user._id, user.targetCareer);
      } catch (e) {
        console.warn('Roadmap update error:', e.message);
      }
    }

    // Log activity
    await Activity.create({
      user: user._id,
      text: 'Updated your profile information',
      icon: 'bi-person-check',
      color: '#F59E0B'
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * @desc    Set/Update target career
 * @route   PUT /api/student/target-career
 * @access  Private
 */
exports.updateTargetCareer = async (req, res) => {
  try {
    const { targetCareer } = req.body;
    if (!targetCareer || !targetCareer.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify a target career.' });
    }

    const user = await User.findById(req.user.id);
    user.targetCareer = targetCareer.trim();
    user.careerInterest = targetCareer.trim();
    await user.save();

    // Automatically generate/refresh roadmap for the selected career
    const roadmapResult = await generateUserRoadmap(user._id, user.targetCareer);

    // Log activity
    await Activity.create({
      user: user._id,
      text: `Selected target career: ${user.targetCareer}`,
      icon: 'bi-compass-fill',
      color: '#059669'
    });

    res.status(200).json({
      success: true,
      message: `Target career updated to ${user.targetCareer}. Roadmap generated!`,
      targetCareer: user.targetCareer,
      roadmapResult
    });
  } catch (error) {
    console.error('Update Target Career Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update target career.' });
  }
};

/**
 * @desc    Get all skills for student
 * @route   GET /api/student/skills
 * @access  Private
 */
exports.getSkills = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { user: req.user.id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    let skills = await Skill.find(filter).sort({ createdAt: -1 });

    // Fallback to User.skills if Skill collection is empty
    if (skills.length === 0 && !category && !search) {
      const user = await User.findById(req.user.id);
      skills = user.skills || [];
    }

    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load skills.' });
  }
};

/**
 * @desc    Get all available platform skills from MongoDB GlobalSkill catalog
 * @route   GET /api/student/skills/available
 * @access  Private / Public
 */
exports.getAvailableSkills = async (req, res) => {
  try {
    const skills = await GlobalSkill.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve available skills.' });
  }
};

/**
 * @desc    Add a new skill to student profile (prevent duplicates)
 * @route   POST /api/student/skills
 * @access  Private
 */
exports.addSkill = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const cleanName = name.trim();
    const normKey = cleanName.toLowerCase();
    const finalCategory = category || 'Programming';

    // When adding a new skill, it MUST be Unassessed & isVerified: false until verified
    const finalProf = 'Unassessed';
    const finalRating = 1;

    // Check duplicate in Skill collection
    let skill = await Skill.findOne({
      user: req.user.id,
      $or: [
        { normalizedName: normKey },
        { name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    });
    if (skill) {
      return res.status(400).json({
        success: false,
        message: `Skill '${cleanName}' already exists in your profile. You can take a verification assessment for it.`
      });
    }

    // Check duplicate in User embedded skills
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const existingIndex = (user.skills || []).findIndex(
      s => s.name && (s.name.toLowerCase() === normKey || (s.normalizedName && s.normalizedName.toLowerCase() === normKey))
    );
    if (existingIndex > -1) {
      return res.status(400).json({
        success: false,
        message: `Skill '${cleanName}' already exists in your profile.`
      });
    }

    // Save to Skill collection as Unassessed
    skill = await Skill.create({
      user: req.user.id,
      name: cleanName,
      normalizedName: normKey,
      category: finalCategory,
      proficiency: finalProf,
      rating: finalRating,
      isVerified: false,
      verificationScore: null,
      verificationDate: null
    });

    // Also sync to User.skills array as Unassessed
    user.skills.push({
      name: cleanName,
      normalizedName: normKey,
      category: finalCategory,
      proficiency: finalProf,
      rating: finalRating,
      isVerified: false,
      verificationScore: null,
      verificationDate: null
    });
    await user.save();

    // Log activity
    await Activity.create({
      user: req.user.id,
      text: `Added skill '${cleanName}' (Verification assessment required)`,
      icon: 'bi-award',
      color: '#059669'
    });

    const allSkills = await Skill.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      message: `Skill '${cleanName}' added. Entrance skill verification assessment is required to identify your proficiency level.`,
      requireVerification: true,
      skillName: cleanName,
      verificationUrl: `entrance-assessment.html?skill=${encodeURIComponent(cleanName)}`,
      skill,
      skills: allSkills
    });
  } catch (error) {
    console.error('Add Skill Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add skill.' });
  }
};

/**
 * @desc    Update proficiency or category of a skill
 * @route   PUT /api/student/skills/:skillId
 * @access  Private
 */
exports.updateSkill = async (req, res) => {
  try {
    const { proficiency, rating, category } = req.body;
    const skillId = req.params.skillId;

    const PROFICIENCY_RANKS = {
      'Beginner': 1,
      'Basic': 2,
      'Intermediate': 3,
      'Advanced': 4,
      'Expert': 5
    };
    const RATING_TO_PROF = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };

    const finalProf = proficiency || (rating ? RATING_TO_PROF[rating] : null);
    const finalRating = finalProf ? (PROFICIENCY_RANKS[finalProf] || 3) : (Number(rating) || null);

    // Update in Skill collection
    let skill = await Skill.findOne({ _id: skillId, user: req.user.id });
    if (skill) {
      if (finalProf) skill.proficiency = finalProf;
      if (finalRating) skill.rating = finalRating;
      if (category) skill.category = category;
      await skill.save();
    }

    // Also sync in User.skills
    const user = await User.findById(req.user.id);
    const userSkill = user.skills.id(skillId) || user.skills.find(s => s._id.toString() === skillId || (skill && s.name.toLowerCase() === skill.name.toLowerCase()));
    if (userSkill) {
      if (finalProf) userSkill.proficiency = finalProf;
      if (finalRating) userSkill.rating = finalRating;
      if (category) userSkill.category = category;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      skill: skill || userSkill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skill.' });
  }
};

/**
 * @desc    Delete a skill from student profile
 * @route   DELETE /api/student/skills/:skillId
 * @access  Private
 */
exports.deleteSkill = async (req, res) => {
  try {
    const skillId = req.params.skillId;

    // Delete from Skill model
    const deletedSkill = await Skill.findOneAndDelete({ _id: skillId, user: req.user.id });

    // Also delete from User.skills array
    const user = await User.findById(req.user.id);
    user.skills = user.skills.filter(s => s._id.toString() !== skillId && (!deletedSkill || s.name.toLowerCase() !== deletedSkill.name.toLowerCase()));
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
