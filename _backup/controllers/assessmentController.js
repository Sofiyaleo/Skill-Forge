/**
 * controllers/assessmentController.js
 * Handles skill assessments, MCQ quiz execution, automated scoring,
 * verification badges, and test histories.
 */

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const Activity = require('../models/Activity');

/**
 * @desc    Get all available assessments
 * @route   GET /api/assessments
 * @access  Private
 */
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().select('-questions.correctOptionIndex -questions.explanation');
    
    // Add question count to each
    const formatted = assessments.map(test => ({
      _id: test._id,
      title: test.title,
      skillCategory: test.skillCategory,
      difficulty: test.difficulty,
      icon: test.icon,
      badgeColor: test.badgeColor,
      durationMinutes: test.durationMinutes,
      passingPercentage: test.passingPercentage,
      questionCount: test.questions ? test.questions.length : 0
    }));

    res.status(200).json({ success: true, count: formatted.length, assessments: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assessments.' });
  }
};

/**
 * @desc    Get single assessment for taking quiz
 * @route   GET /api/assessments/:id
 * @access  Private
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Hide answers from client during quiz
    const safeQuestions = assessment.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        skillCategory: assessment.skillCategory,
        durationMinutes: assessment.durationMinutes,
        passingPercentage: assessment.passingPercentage,
        questions: safeQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load test questions.' });
  }
};

/**
 * @desc    Submit assessment answers & evaluate score
 * @route   POST /api/assessments/:id/submit
 * @access  Private
 */
exports.submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices [0, 1, 3, ...]
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    const totalQuestions = assessment.questions.length;
    let score = 0;
    const review = [];

    assessment.questions.forEach((q, idx) => {
      const selectedIndex = answers && answers[idx] !== undefined ? Number(answers[idx]) : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) score++;

      review.push({
        questionText: q.questionText,
        options: q.options,
        userSelected: selectedIndex,
        correctIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= assessment.passingPercentage;

    // Save assessment result
    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment._id,
      assessmentTitle: assessment.title,
      score,
      totalQuestions,
      percentage,
      passed
    });

    // If passed, verify skill on student profile
    const user = await User.findById(req.user.id);
    // Extract base skill name (e.g., 'JavaScript Basics' -> 'JavaScript')
    const skillKeyword = assessment.title.split(' ')[0];
    const skillIndex = user.skills.findIndex(s => s.name.toLowerCase().includes(skillKeyword.toLowerCase()));

    if (passed) {
      if (skillIndex !== -1) {
        user.skills[skillIndex].isVerified = true;
        user.skills[skillIndex].rating = Math.max(user.skills[skillIndex].rating, 4);
      } else {
        user.skills.push({
          name: skillKeyword,
          category: assessment.skillCategory || 'Frontend',
          rating: 4,
          isVerified: true
        });
      }
      await user.save();
    }

    // Log Activity
    await Activity.create({
      user: req.user.id,
      text: `${passed ? 'Passed' : 'Attempted'} ${assessment.title} (${percentage}%)`,
      icon: passed ? 'bi-patch-check-fill' : 'bi-clipboard-x',
      color: passed ? '#10B981' : '#F59E0B'
    });

    res.status(200).json({
      success: true,
      result: {
        score,
        totalQuestions,
        percentage,
        passed,
        passingPercentage: assessment.passingPercentage,
        review
      }
    });
  } catch (error) {
    console.error('Submit Assessment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process assessment submission.' });
  }
};

/**
 * @desc    Get user's previous test results
 * @route   GET /api/assessments/my-results
 * @access  Private
 */
exports.getMyResults = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ user: req.user.id }).sort({ completedAt: -1 });
    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment results.' });
  }
};
