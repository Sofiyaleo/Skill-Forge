/**
 * controllers/entranceAssessmentController.js
 * Handles Student Entrance Assessment & Automatic Skill Level Identification:
 * - Retrieving entrance assessment eligibility & claimed skills
 * - Delivering 5 progressive sanitized questions per claimed skill
 * - Automatic skill level evaluation (0-1 Beginner, 2-3 Intermediate, 4-5 Advanced)
 * - Saving partial progress for resuming incomplete assessments
 * - Updating identified proficiency levels on User and Skill models
 * - Supporting retakes with complete attempt history preservation
 */

const User = require('../models/User');
const Skill = require('../models/Skill');
const AssessmentResult = require('../models/AssessmentResult');
const Activity = require('../models/Activity');
const {
  getQuestionsForSkill,
  evaluateSkillSubmission,
  calculateSkillLevel,
  normalizeSkillKey
} = require('../data/entranceQuestions');

/**
 * @desc    Get entrance assessment status, claimed skills, and any saved progress for the logged-in student
 * @route   GET /api/entrance-assessment/status
 * @access  Private (Student)
 */
exports.getAssessmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    // Retrieve real student skills from Skill collection & user.skills
    const dbSkills = await Skill.find({ user: userId });
    const userSkills = user.skills || [];
    const skillMap = new Map();

    userSkills.forEach(s => {
      if (s && s.name) {
        skillMap.set((s.normalizedName || s.name).toLowerCase(), s);
      }
    });

    dbSkills.forEach(s => {
      if (s && s.name) {
        skillMap.set((s.normalizedName || s.name).toLowerCase(), s);
      }
    });

    const studentSkills = Array.from(skillMap.values()).map(s => ({
      _id: s._id,
      name: s.name,
      category: s.category || 'Programming',
      proficiency: s.proficiency || 'Unassessed',
      identifiedLevel: s.proficiency || 'Unassessed',
      isVerified: Boolean(s.isVerified),
      verificationScore: s.verificationScore || null,
      verificationDate: s.verificationDate || null
    }));

    // Retrieve previous entrance assessment results
    const pastResults = await AssessmentResult.find({
      user: userId,
      type: 'entrance'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        studentName: user.name,
        targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
        entranceAssessmentCompleted: Boolean(user.entranceAssessmentCompleted),
        entranceAssessmentStatus: user.entranceAssessmentStatus || 'not_started',
        entranceAssessmentDate: user.entranceAssessmentDate || null,
        entranceAssessmentSummary: user.entranceAssessmentSummary || null,
        entranceAssessmentProgress: user.entranceAssessmentProgress || {
          completedSkillNames: [],
          currentSkillIndex: 0,
          savedAnswers: {}
        },
        skillsCount: studentSkills.length,
        skills: studentSkills,
        pastResultsCount: pastResults.length,
        pastResults: pastResults.map(r => ({
          _id: r._id,
          skillName: r.skillName || r.topic,
          score: r.score,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
          identifiedLevel: r.identifiedLevel || (r.passed ? 'Intermediate' : 'Beginner'),
          passed: r.passed,
          verificationStatus: r.verificationStatus || (r.passed ? 'VERIFIED' : 'NOT VERIFIED'),
          attemptNumber: r.attemptNumber || 1,
          completedAt: r.completedAt || r.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get Entrance Assessment Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment status.' });
  }
};

/**
 * @desc    Save partial assessment progress so student can resume later
 * @route   POST /api/entrance-assessment/progress
 * @access  Private (Student)
 */
exports.saveAssessmentProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentSkillIndex, savedAnswers, completedSkillNames } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    if (!user.entranceAssessmentCompleted) {
      user.entranceAssessmentStatus = 'in_progress';
    }

    user.entranceAssessmentProgress = {
      currentSkillIndex: typeof currentSkillIndex === 'number' ? currentSkillIndex : 0,
      savedAnswers: savedAnswers || {},
      completedSkillNames: Array.isArray(completedSkillNames) ? completedSkillNames : []
    };

    await user.save();
    res.status(200).json({ success: true, message: 'Progress saved successfully.' });
  } catch (error) {
    console.error('Save Progress Error:', error);
    res.status(500).json({ success: false, message: 'Failed to save assessment progress.' });
  }
};

/**
 * @desc    Get sanitized assessment questions ONLY for the skills claimed by the student (5 progressive questions per skill)
 * @route   GET /api/entrance-assessment/questions
 * @access  Private (Student)
 */
exports.getAssessmentQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    // Support single-skill verification mode when ?skill=SkillName is provided
    const requestedSkill = req.query.skill ? decodeURIComponent(req.query.skill).trim() : null;
    if (requestedSkill) {
      const dbSkill = await Skill.findOne({
        user: userId,
        $or: [
          { name: new RegExp(`^${requestedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { normalizedName: requestedSkill.toLowerCase() }
        ]
      });
      const userSkill = (user.skills || []).find(
        s => s.name && s.name.toLowerCase() === requestedSkill.toLowerCase()
      );

      const qData = getQuestionsForSkill(requestedSkill, true);
      const singleAssessment = {
        skillName: (dbSkill && dbSkill.name) || (userSkill && userSkill.name) || requestedSkill,
        normalizedKey: qData.normalizedKey,
        category: (dbSkill && dbSkill.category) || (userSkill && userSkill.category) || qData.category,
        description: qData.description,
        isVerified: dbSkill ? Boolean(dbSkill.isVerified) : false,
        proficiency: (dbSkill && dbSkill.proficiency) || 'Unassessed',
        totalQuestions: qData.totalQuestions || 5,
        questions: qData.questions
      };

      return res.status(200).json({
        success: true,
        isSingleSkillVerification: true,
        targetSkill: singleAssessment.skillName,
        targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
        totalSkills: 1,
        assessments: [singleAssessment]
      });
    }

    // Consolidate student's claimed skills
    const dbSkills = await Skill.find({ user: userId });
    const userSkills = user.skills || [];
    const skillNameSet = new Set();
    const skillsList = [];

    const addSkill = (s) => {
      if (!s || !s.name || !s.name.trim()) return;
      const clean = s.name.trim();
      const norm = clean.toLowerCase();
      if (!skillNameSet.has(norm)) {
        skillNameSet.add(norm);
        skillsList.push({
          name: clean,
          category: s.category || 'Technical',
          isVerified: Boolean(s.isVerified),
          proficiency: s.proficiency || 'Unassessed'
        });
      }
    };

    userSkills.forEach(addSkill);
    dbSkills.forEach(addSkill);

    // If no skills recorded, provide foundational starter skills
    if (skillsList.length === 0) {
      ['HTML5', 'CSS3', 'JavaScript'].forEach(name => {
        skillsList.push({ name, category: 'Web Development', isVerified: false, proficiency: 'Unassessed' });
      });
    }

    // Build question sets for each claimed skill (sanitized without answers or explanations, exactly 5 questions)
    const assessments = skillsList.map(s => {
      const qData = getQuestionsForSkill(s.name, true);
      return {
        skillName: s.name,
        normalizedKey: qData.normalizedKey,
        category: s.category || qData.category,
        description: qData.description,
        isVerified: s.isVerified,
        proficiency: s.proficiency || 'Unassessed',
        totalQuestions: qData.totalQuestions || 5,
        questions: qData.questions
      };
    });

    res.status(200).json({
      success: true,
      targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
      totalSkills: assessments.length,
      assessments
    });
  } catch (error) {
    console.error('Get Assessment Questions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load assessment questions.' });
  }
};

/**
 * @desc    Submit full entrance assessment answers across all claimed skills and determine identified proficiency levels
 * @route   POST /api/entrance-assessment/submit
 * @access  Private (Student)
 */
exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const { submissions } = req.body;
    if (!submissions || (typeof submissions !== 'object' && !Array.isArray(submissions))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission data. Please provide answers for your skills.'
      });
    }

    let submissionEntries = [];
    if (Array.isArray(submissions)) {
      submissionEntries = submissions;
    } else {
      submissionEntries = Object.entries(submissions).map(([skillName, answers]) => ({
        skillName,
        answers
      }));
    }

    if (submissionEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skill assessment answers provided.'
      });
    }

    const results = [];
    let totalScore = 0;
    let totalPossible = 0;
    let verifiedCount = 0;

    for (const entry of submissionEntries) {
      const { skillName, answers } = entry;
      if (!skillName) continue;

      // Evaluate server-side with 5 questions & automatic level identification
      const evalResult = evaluateSkillSubmission(skillName, answers);

      // Check previous attempt count for this skill
      const normKey = normalizeSkillKey(skillName);
      const prevAttemptCount = await AssessmentResult.countDocuments({
        user: userId,
        type: 'entrance',
        $or: [
          { skillName: new RegExp(`^${skillName}$`, 'i') },
          { topic: normKey }
        ]
      });

      const attemptNumber = prevAttemptCount + 1;

      // Save AssessmentResult in MongoDB
      const savedResult = await AssessmentResult.create({
        user: userId,
        skillName: evalResult.skillName,
        topic: evalResult.normalizedKey,
        assessmentTitle: `${evalResult.skillName} Entrance Verification`,
        type: 'entrance',
        score: evalResult.score,
        totalQuestions: evalResult.totalQuestions,
        correctAnswersCount: evalResult.correctAnswersCount,
        percentage: evalResult.percentage,
        passingThreshold: 60,
        passed: evalResult.passed,
        verificationStatus: evalResult.verificationStatus,
        identifiedLevel: evalResult.identifiedLevel,
        attemptNumber,
        answers: evalResult.review,
        completedAt: new Date()
      });

      const isPassed = evalResult.passed;
      if (isPassed) {
        verifiedCount++;
      }
      totalScore += evalResult.score;
      totalPossible += evalResult.totalQuestions;

      // Rating map for identified proficiency
      const rating = evalResult.identifiedLevel === 'Advanced' ? 5 : (evalResult.identifiedLevel === 'Intermediate' ? 3 : 1);

      // Update User embedded skills
      const skillLower = evalResult.skillName.toLowerCase();
      const existingIdx = user.skills.findIndex(
        s => s.name.toLowerCase() === skillLower || s.name.toLowerCase().includes(normKey)
      );

      if (existingIdx > -1) {
        user.skills[existingIdx].isVerified = isPassed;
        user.skills[existingIdx].proficiency = evalResult.identifiedLevel;
        user.skills[existingIdx].rating = rating;
        user.skills[existingIdx].verificationScore = evalResult.percentage;
        user.skills[existingIdx].verificationDate = new Date();
      } else {
        user.skills.push({
          name: evalResult.skillName,
          normalizedName: evalResult.normalizedKey,
          category: evalResult.category,
          proficiency: evalResult.identifiedLevel,
          rating,
          isVerified: isPassed,
          verificationScore: evalResult.percentage,
          verificationDate: new Date()
        });
      }

      // Update or create in standalone Skill collection
      const existingSkillDoc = await Skill.findOne({
        user: userId,
        $or: [
          { name: new RegExp(`^${evalResult.skillName}$`, 'i') },
          { normalizedName: evalResult.normalizedKey }
        ]
      });

      if (existingSkillDoc) {
        existingSkillDoc.proficiency = evalResult.identifiedLevel;
        existingSkillDoc.isVerified = isPassed;
        existingSkillDoc.rating = rating;
        existingSkillDoc.verificationScore = evalResult.percentage;
        existingSkillDoc.verificationDate = new Date();
        existingSkillDoc.verificationAttempts = (existingSkillDoc.verificationAttempts || 0) + 1;
        await existingSkillDoc.save();
      } else {
        await Skill.create({
          user: userId,
          name: evalResult.skillName,
          normalizedName: evalResult.normalizedKey,
          category: evalResult.category,
          proficiency: evalResult.identifiedLevel,
          rating,
          isVerified: isPassed,
          verificationScore: evalResult.percentage,
          verificationDate: new Date(),
          verificationAttempts: 1
        });
      }

      results.push({
        _id: savedResult._id,
        skillName: evalResult.skillName,
        score: evalResult.score,
        totalQuestions: evalResult.totalQuestions,
        correctAnswersCount: evalResult.correctAnswersCount,
        percentage: evalResult.percentage,
        identifiedLevel: evalResult.identifiedLevel,
        passingThreshold: 60,
        passed: evalResult.passed,
        verificationStatus: evalResult.verificationStatus,
        attemptNumber,
        review: evalResult.review
      });
    }

    // Update User model entrance assessment status
    const allStudentSkills = await Skill.find({ user: userId });
    const verifiedDbCount = allStudentSkills.filter(s => s.isVerified).length;
    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    user.entranceAssessmentCompleted = true;
    user.entranceAssessmentStatus = 'completed';
    user.entranceAssessmentDate = user.entranceAssessmentDate || new Date();
    user.entranceAssessmentSummary = {
      totalSkillsAssessed: allStudentSkills.length > 0 ? allStudentSkills.length : results.length,
      verifiedSkillsCount: verifiedDbCount,
      averageScore: user.entranceAssessmentSummary && user.entranceAssessmentSummary.averageScore
        ? Math.round((user.entranceAssessmentSummary.averageScore + averageScore) / 2)
        : averageScore
    };
    user.entranceAssessmentProgress = {
      completedSkillNames: submissionEntries.map(e => e.skillName),
      currentSkillIndex: 0,
      savedAnswers: {}
    };

    await user.save();

    // Log Activity
    const activityText = results.length === 1
      ? `Completed Entrance Skill Verification for ${results[0].skillName}: Level identified as ${results[0].identifiedLevel} (${results[0].score}/5)`
      : `Completed Entrance Assessment: Skill levels identified for ${results.length} skills (${verifiedCount} verified)`;

    await Activity.create({
      user: userId,
      text: activityText,
      icon: verifiedCount > 0 ? 'bi-patch-check-fill' : 'bi-clipboard-check',
      color: verifiedCount > 0 ? '#10B981' : '#F59E0B'
    });

    res.status(200).json({
      success: true,
      message: 'Entrance assessment evaluated and recorded successfully.',
      summary: {
        totalSkillsAssessed: results.length,
        verifiedSkillsCount: verifiedCount,
        unverifiedCount: results.length - verifiedCount,
        averageScore,
        completedAt: user.entranceAssessmentDate,
        foundationalNotice: 'The identified proficiency level represents an estimated foundational proficiency level based on the five-question assessment, not a professional certification.'
      },
      results
    });
  } catch (error) {
    console.error('Submit Entrance Assessment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while evaluating assessment.'
    });
  }
};

/**
 * @desc    Retake a single skill assessment
 * @route   POST /api/entrance-assessment/retake/:skillName
 * @access  Private (Student)
 */
exports.retakeSkillAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillName = decodeURIComponent(req.params.skillName);
    const { answers } = req.body;

    if (!answers || (!Array.isArray(answers) && typeof answers !== 'object')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid answers to retake this skill assessment.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    // Evaluate on server (5 questions)
    const evalResult = evaluateSkillSubmission(skillName, answers);
    const normKey = normalizeSkillKey(skillName);

    // Calculate attempt number
    const escapedName = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prevAttempts = await AssessmentResult.countDocuments({
      user: userId,
      type: 'entrance',
      $or: [
        { skillName: new RegExp(`^${escapedName}$`, 'i') },
        { topic: normKey }
      ]
    });
    const attemptNumber = prevAttempts + 1;

    // Create new AssessmentResult record (preserving full history)
    const savedResult = await AssessmentResult.create({
      user: userId,
      skillName: evalResult.skillName,
      topic: evalResult.normalizedKey,
      assessmentTitle: attemptNumber > 1
        ? `${evalResult.skillName} Entrance Verification (Attempt #${attemptNumber})`
        : `${evalResult.skillName} Entrance Skill Verification`,
      type: 'entrance',
      score: evalResult.score,
      totalQuestions: evalResult.totalQuestions,
      correctAnswersCount: evalResult.correctAnswersCount,
      percentage: evalResult.percentage,
      identifiedLevel: evalResult.identifiedLevel,
      passingThreshold: 60,
      passed: evalResult.passed,
      verificationStatus: evalResult.verificationStatus,
      attemptNumber,
      answers: evalResult.review,
      completedAt: new Date()
    });

    const rating = evalResult.identifiedLevel === 'Advanced' ? 5 : (evalResult.identifiedLevel === 'Intermediate' ? 3 : 1);

    // Update skill on user
    const skillLower = evalResult.skillName.toLowerCase();
    const existingIdx = user.skills.findIndex(
      s => s.name && (s.name.toLowerCase() === skillLower || s.name.toLowerCase().includes(normKey))
    );

    if (existingIdx > -1) {
      user.skills[existingIdx].isVerified = evalResult.passed;
      user.skills[existingIdx].proficiency = evalResult.identifiedLevel;
      user.skills[existingIdx].rating = rating;
      user.skills[existingIdx].verificationScore = evalResult.percentage;
      user.skills[existingIdx].verificationDate = new Date();
    } else {
      user.skills.push({
        name: evalResult.skillName,
        normalizedName: evalResult.normalizedKey,
        category: evalResult.category,
        proficiency: evalResult.identifiedLevel,
        rating,
        isVerified: evalResult.passed,
        verificationScore: evalResult.percentage,
        verificationDate: new Date()
      });
    }

    // Update Skill collection
    await Skill.updateMany(
      {
        user: userId,
        $or: [
          { name: new RegExp(`^${escapedName}$`, 'i') },
          { normalizedName: evalResult.normalizedKey }
        ]
      },
      {
        $set: {
          proficiency: evalResult.identifiedLevel,
          isVerified: evalResult.passed,
          rating,
          verificationScore: evalResult.percentage,
          verificationDate: new Date()
        },
        $inc: { verificationAttempts: 1 }
      }
    );

    // Ensure entranceAssessmentCompleted flag is true
    user.entranceAssessmentCompleted = true;
    user.entranceAssessmentStatus = 'completed';
    user.entranceAssessmentDate = user.entranceAssessmentDate || new Date();

    // Recalculate summary stats
    const allStudentSkills = await Skill.find({ user: userId });
    const verifiedDbCount = allStudentSkills.filter(s => s.isVerified).length;
    user.entranceAssessmentSummary = {
      totalSkillsAssessed: allStudentSkills.length,
      verifiedSkillsCount: verifiedDbCount,
      averageScore: user.entranceAssessmentSummary && user.entranceAssessmentSummary.averageScore
        ? Math.round((user.entranceAssessmentSummary.averageScore + evalResult.percentage) / 2)
        : evalResult.percentage
    };
    await user.save();

    // Log Activity
    await Activity.create({
      user: userId,
      text: `Completed Entrance Verification for ${evalResult.skillName}: Level identified as ${evalResult.identifiedLevel} (${evalResult.score}/5)`,
      icon: evalResult.passed ? 'bi-patch-check-fill' : 'bi-arrow-clockwise',
      color: evalResult.passed ? '#10B981' : '#3B82F6'
    });

    res.status(200).json({
      success: true,
      message: `Assessment completed. Your identified proficiency level for ${evalResult.skillName} is ${evalResult.identifiedLevel} (${evalResult.score}/5).`,
      result: {
        _id: savedResult._id,
        skillName: evalResult.skillName,
        score: evalResult.score,
        totalQuestions: evalResult.totalQuestions,
        correctAnswersCount: evalResult.correctAnswersCount,
        percentage: evalResult.percentage,
        identifiedLevel: evalResult.identifiedLevel,
        passingThreshold: 60,
        passed: evalResult.passed,
        verificationStatus: evalResult.verificationStatus,
        attemptNumber,
        review: evalResult.review
      }
    });
  } catch (error) {
    console.error('Retake Skill Assessment Error:', error);
    res.status(500).json({ success: false, message: 'Server error while processing retake.' });
  }
};

/**
 * @desc    Verify a single newly added skill (alias to retakeSkillAssessment)
 * @route   POST /api/entrance-assessment/verify/:skillName
 * @access  Private (Student)
 */
exports.verifySingleSkill = exports.retakeSkillAssessment;
