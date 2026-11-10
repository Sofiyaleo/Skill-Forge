/**
 * controllers/assessmentController.js
 * Handles skill assessments, MCQ quiz execution, automated server-side scoring,
 * verification badges, and test histories.
 */

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Activity = require('../models/Activity');
const { questions, topics, getTopicById, getQuestionsByTopic, scoreQuiz } = require('../data/questions');

/**
 * @desc    Get all available assessments
 * @route   GET /api/assessments
 * @access  Private
 */
exports.getAssessments = async (req, res) => {
  try {
    let assessments = await Assessment.find().select('-questions.correctOptionIndex -questions.explanation');

    // If DB is empty, auto-populate from questions data
    if (assessments.length === 0 && topics && topics.length > 0) {
      for (const t of topics) {
        const tQuestions = getQuestionsByTopic(t.id, false);
        try {
          await Assessment.create({
            topic: t.id,
            title: t.displayName || t.name,
            skillCategory: t.id === 'html' || t.id === 'css' || t.id === 'javascript' ? 'Frontend' : (t.id === 'sql' ? 'Database' : 'Core CS'),
            difficulty: 'Beginner',
            icon: t.icon,
            badgeColor: t.id === 'html' ? '#059669' : (t.id === 'javascript' ? '#F59E0B' : '#10B981'),
            durationMinutes: t.estimatedMinutes || 10,
            passingPercentage: 70,
            questions: tQuestions.map((q, idx) => ({
              questionId: q.id || `q_${idx}`,
              questionText: q.question,
              options: q.options,
              correctOptionIndex: q.correctIndex,
              explanation: q.explanation || ''
            }))
          });
        } catch (e) {
          // Continue
        }
      }
      assessments = await Assessment.find().select('-questions.correctOptionIndex -questions.explanation');
    }

    const formatted = assessments.map(test => ({
      _id: test._id,
      topic: test.topic,
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
    console.error('Get Assessments Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessments.' });
  }
};

/**
 * @desc    Get single assessment for taking quiz (sanitized questions without answers)
 * @route   GET /api/assessments/:id
 * @access  Private
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const idOrTopic = req.params.id;
    let assessment = await Assessment.findById(idOrTopic).catch(() => null);

    if (!assessment) {
      assessment = await Assessment.findOne({
        $or: [
          { topic: idOrTopic.toLowerCase() },
          { title: { $regex: new RegExp(`^${idOrTopic}$`, 'i') } }
        ]
      });
    }

    // Fallback to static questions module
    if (!assessment) {
      const topic = getTopicById(idOrTopic);
      if (topic) {
        const sanitizedQuestions = getQuestionsByTopic(topic.id, true);
        return res.status(200).json({
          success: true,
          assessment: {
            _id: topic.id,
            topic: topic.id,
            title: topic.displayName || topic.name,
            skillCategory: 'Technical',
            durationMinutes: topic.estimatedMinutes || 10,
            passingPercentage: 70,
            questions: sanitizedQuestions.map((q, idx) => ({
              _id: q.id || `q_${idx}`,
              questionText: q.question,
              options: q.options
            }))
          }
        });
      }
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    // Hide answers and explanations from client during quiz
    const safeQuestions = assessment.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      assessment: {
        _id: assessment._id,
        topic: assessment.topic,
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
 * @desc    Submit assessment answers & evaluate score on server
 * @route   POST /api/assessments/:id/submit
 * @access  Private
 */
exports.submitAssessment = async (req, res) => {
  try {
    const idOrTopic = req.params.id;
    const { answers } = req.body; // Can be array [0, 2, 1] or object { 'q1': 0 }

    let assessment = await Assessment.findById(idOrTopic).catch(() => null);
    if (!assessment) {
      assessment = await Assessment.findOne({
        $or: [
          { topic: idOrTopic.toLowerCase() },
          { title: { $regex: new RegExp(`^${idOrTopic}$`, 'i') } }
        ]
      });
    }

    let score = 0;
    let totalQuestions = 0;
    let passingPercentage = 70;
    let assessmentTitle = 'Skill Assessment';
    let review = [];

    if (assessment) {
      totalQuestions = assessment.questions.length;
      passingPercentage = assessment.passingPercentage || 70;
      assessmentTitle = assessment.title;

      assessment.questions.forEach((q, idx) => {
        let userVal = -1;
        if (Array.isArray(answers)) {
          userVal = answers[idx] !== undefined ? Number(answers[idx]) : -1;
        } else if (answers && typeof answers === 'object') {
          userVal = answers[q.questionId || q._id] !== undefined ? Number(answers[q.questionId || q._id]) : -1;
        }

        const isCorrect = userVal === q.correctOptionIndex;
        if (isCorrect) score++;

        review.push({
          questionText: q.questionText,
          options: q.options,
          userSelected: userVal,
          correctIndex: q.correctOptionIndex,
          isCorrect,
          explanation: q.explanation || ''
        });
      });
    } else {
      // Evaluate against static questions
      const topicObj = getTopicById(idOrTopic);
      if (!topicObj) {
        return res.status(404).json({ success: false, message: 'Assessment not found.' });
      }
      const evalResult = scoreQuiz(topicObj.id, answers);
      score = evalResult.score;
      totalQuestions = evalResult.totalQuestions;
      assessmentTitle = topicObj.displayName || topicObj.name;
      review = evalResult.answers.map(a => ({
        questionText: a.question,
        options: a.options,
        userSelected: a.userSelected,
        correctIndex: a.correctIndex,
        isCorrect: a.isCorrect,
        explanation: a.explanation
      }));
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= passingPercentage;

    // Persist assessment result in MongoDB
    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment ? assessment._id : undefined,
      topic: assessment ? assessment.topic : idOrTopic,
      assessmentTitle,
      score,
      totalQuestions,
      percentage,
      passed,
      answers: review
    });

    // If passed, mark skill as verified on student profile
    const user = await User.findById(req.user.id);
    const skillKeyword = assessmentTitle.split(' ')[0].toLowerCase();
    
    // Check embedded skills
    const embeddedIdx = user.skills.findIndex(s => s.name.toLowerCase().includes(skillKeyword));
    if (passed) {
      if (embeddedIdx > -1) {
        user.skills[embeddedIdx].isVerified = true;
        user.skills[embeddedIdx].rating = Math.max(user.skills[embeddedIdx].rating, 4);
        user.skills[embeddedIdx].proficiency = 'Advanced';
      } else {
        user.skills.push({
          name: assessmentTitle.split('&')[0].trim(),
          category: 'Programming',
          proficiency: 'Advanced',
          rating: 4,
          isVerified: true
        });
      }
      await user.save();

      // Also update Skill collection
      await Skill.updateMany(
        { user: req.user.id, normalizedName: { $regex: skillKeyword, $options: 'i' } },
        { isVerified: true, rating: 4, proficiency: 'Advanced' }
      );
    }

    // Log Activity
    await Activity.create({
      user: req.user.id,
      text: `${passed ? 'Passed' : 'Completed'} ${assessmentTitle} Assessment (${percentage}%)`,
      icon: passed ? 'bi-patch-check-fill' : 'bi-clipboard-check',
      color: passed ? '#10B981' : '#F59E0B'
    });

    res.status(200).json({
      success: true,
      result: {
        _id: result._id,
        assessmentTitle,
        score,
        totalQuestions,
        percentage,
        passed,
        passingPercentage,
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
