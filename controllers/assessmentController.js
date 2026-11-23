/**
 * controllers/assessmentController.js
 * Handles skill improvement / practice assessments, MCQ quiz execution,
 * automated server-side scoring, detailed answer review with explanations,
 * improvement recommendations, and MongoDB history persistence.
 */

const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Activity = require('../models/Activity');
const { topics, getTopicById, getQuestionsByTopic, scoreQuiz } = require('../data/questions');

/**
 * Helper to ensure all practice assessment topics exist in MongoDB
 */
async function syncAssessmentCatalog() {
  try {
    for (const t of topics) {
      const existing = await Assessment.findOne({ topic: t.id });
      const tQuestions = getQuestionsByTopic(t.id, false);
      const mappedQuestions = tQuestions.map((q, idx) => ({
        questionId: q.id || `q_${t.id}_${idx}`,
        questionText: q.question,
        concept: q.concept || t.name,
        options: (q.options || []).map(opt => (typeof opt === 'object' && opt !== null ? (opt.text || opt.option || JSON.stringify(opt)) : String(opt))),
        correctOptionIndex: q.correctIndex,
        explanation: q.explanation || ''
      }));

      if (!existing) {
        await Assessment.create({
          topic: t.id,
          title: t.displayName || t.name,
          skillCategory: t.skillCategory || 'Technical',
          difficulty: 'Beginner',
          icon: t.icon,
          badgeColor: t.badgeColor || '#059669',
          description: t.description || `Practice assessment to improve skills in ${t.name}.`,
          durationMinutes: t.estimatedMinutes || 6,
          passingPercentage: 60,
          questions: mappedQuestions
        });
      } else {
        // Keep practice assessment questions, metadata and options fresh and clean
        existing.questions = mappedQuestions;
        if (t.displayName || t.name) existing.title = t.displayName || t.name;
        if (t.skillCategory) existing.skillCategory = t.skillCategory;
        if (t.badgeColor) existing.badgeColor = t.badgeColor;
        if (t.icon) existing.icon = t.icon;
        if (t.description) existing.description = t.description;
        await existing.save();
      }
    }
  } catch (err) {
    console.warn('Sync Assessment Catalog Notice:', err.message);
  }
}

/**
 * @desc    Get all available practice assessments
 * @route   GET /api/assessments
 * @access  Private
 */
exports.getAssessments = async (req, res) => {
  try {
    await syncAssessmentCatalog();

    const assessments = await Assessment.find()
      .select('-questions.correctOptionIndex -questions.explanation')
      .sort({ createdAt: 1 });

    const formatted = assessments.map(test => ({
      _id: test._id,
      topic: test.topic,
      title: test.title,
      skillCategory: test.skillCategory,
      difficulty: test.difficulty || 'Beginner',
      icon: test.icon,
      badgeColor: test.badgeColor,
      durationMinutes: test.durationMinutes || 6,
      passingPercentage: test.passingPercentage || 60,
      description: test.description || '',
      questionCount: test.questions ? Math.min(test.questions.length, 5) : 5
    }));

    res.status(200).json({ success: true, count: formatted.length, assessments: formatted });
  } catch (error) {
    console.error('Get Assessments Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve assessments.' });
  }
};

/**
 * @desc    Get single practice assessment for taking quiz (sanitized questions without answers)
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

    const topicKey = assessment ? assessment.topic : idOrTopic.toLowerCase();
    const topicObj = getTopicById(topicKey);

    // If assessment found in DB with questions
    if (assessment && assessment.questions && assessment.questions.length >= 5) {
      const safeQuestions = assessment.questions.slice(0, 5).map((q, idx) => {
        const rawOpts = q.options || q.choices || q.answers || [];
        const cleanOptions = rawOpts.map(opt => {
          if (opt === null || opt === undefined) return '';
          if (typeof opt === 'object') {
            return opt.text || opt.option || opt.optionText || opt.choice || opt.value || opt.label || JSON.stringify(opt);
          }
          return String(opt);
        });

        const qId = q.questionId || (q._id ? q._id.toString() : `q_${idx}`);
        const qText = q.questionText || q.question || '';
        const conceptText = q.concept || (topicObj ? topicObj.name : 'Core Principles');

        return {
          _id: q._id ? q._id.toString() : qId,
          questionId: qId,
          questionText: qText,
          concept: conceptText,
          options: cleanOptions,
          choices: cleanOptions,
          answers: cleanOptions
        };
      });

      return res.status(200).json({
        success: true,
        assessment: {
          _id: assessment._id,
          topic: assessment.topic,
          title: assessment.title,
          skillCategory: assessment.skillCategory,
          difficulty: assessment.difficulty || 'Beginner',
          durationMinutes: assessment.durationMinutes || 6,
          passingPercentage: assessment.passingPercentage || 60,
          questions: safeQuestions
        }
      });
    }

    // Fallback to static questions
    if (topicObj) {
      const sanitizedQuestions = getQuestionsByTopic(topicObj.id, true).slice(0, 5);
      return res.status(200).json({
        success: true,
        assessment: {
          _id: assessment ? assessment._id : topicObj.id,
          topic: topicObj.id,
          title: topicObj.displayName || topicObj.name,
          skillCategory: topicObj.skillCategory || 'Technical',
          difficulty: 'Beginner',
          durationMinutes: topicObj.estimatedMinutes || 6,
          passingPercentage: 60,
          questions: sanitizedQuestions.map((q, idx) => {
            const rawOpts = q.options || q.choices || q.answers || [];
            const cleanOptions = rawOpts.map(opt => {
              if (opt === null || opt === undefined) return '';
              if (typeof opt === 'object') {
                return opt.text || opt.option || opt.optionText || opt.choice || opt.value || opt.label || JSON.stringify(opt);
              }
              return String(opt);
            });
            const qId = q.id || `q_${idx}`;
            return {
              _id: qId,
              questionId: qId,
              questionText: q.question,
              concept: q.concept || topicObj.name,
              options: cleanOptions,
              choices: cleanOptions,
              answers: cleanOptions
            };
          })
        }
      });
    }

    return res.status(404).json({ success: false, message: 'Assessment not found.' });
  } catch (error) {
    console.error('Get Assessment By ID Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load test questions.' });
  }
};

/**
 * @desc    Submit assessment answers & evaluate score securely on server
 * @route   POST /api/assessments/:id/submit
 * @access  Private
 */
exports.submitAssessment = async (req, res) => {
  try {
    const idOrTopic = req.params.id;
    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({ success: false, message: 'No answers submitted.' });
    }

    let assessment = await Assessment.findById(idOrTopic).catch(() => null);
    if (!assessment) {
      assessment = await Assessment.findOne({
        $or: [
          { topic: idOrTopic.toLowerCase() },
          { title: { $regex: new RegExp(`^${idOrTopic}$`, 'i') } }
        ]
      });
    }

    const topicKey = assessment ? assessment.topic : idOrTopic.toLowerCase();
    const topicObj = getTopicById(topicKey) || (assessment ? { id: assessment.topic, name: assessment.title, displayName: assessment.title } : null);

    let score = 0;
    const totalQuestions = 5;
    const passingPercentage = assessment ? (assessment.passingPercentage || 60) : 60;
    const assessmentTitle = assessment ? assessment.title : (topicObj ? topicObj.displayName || topicObj.name : 'Skill Assessment');
    const review = [];
    const topicsToImproveSet = new Set();

    // Retrieve source questions with correct answers
    const sourceQuestions = (assessment && assessment.questions && assessment.questions.length >= 5)
      ? assessment.questions.slice(0, 5)
      : (topicObj ? getQuestionsByTopic(topicObj.id, false).slice(0, 5) : []);

    if (sourceQuestions.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment questions not found.' });
    }

    sourceQuestions.forEach((q, idx) => {
      const qId = q.id || q.questionId || (q._id ? q._id.toString() : `q_${idx}`);
      let userVal = -1;

      if (Array.isArray(answers)) {
        userVal = (answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '') ? Number(answers[idx]) : -1;
      } else if (answers && typeof answers === 'object') {
        if (answers[qId] !== undefined && answers[qId] !== null && answers[qId] !== '') {
          userVal = Number(answers[qId]);
        } else if (answers[q._id] !== undefined && answers[q._id] !== null && answers[q._id] !== '') {
          userVal = Number(answers[q._id]);
        } else if (answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '') {
          userVal = Number(answers[idx]);
        }
      }

      const qText = q.question || q.questionText;
      const correctIdx = q.correctIndex !== undefined ? q.correctIndex : q.correctOptionIndex;
      const isCorrect = userVal === correctIdx;

      if (isCorrect) {
        score++;
      } else {
        if (q.concept) {
          topicsToImproveSet.add(q.concept);
        }
      }

      const rawOpts = q.options || q.choices || q.answers || [];
      const cleanOptions = rawOpts.map(opt => {
        if (opt === null || opt === undefined) return '';
        if (typeof opt === 'object') {
          return opt.text || opt.option || opt.optionText || opt.choice || opt.value || opt.label || JSON.stringify(opt);
        }
        return String(opt);
      });

      const selectedOptText = (userVal >= 0 && userVal < cleanOptions.length) ? cleanOptions[userVal] : 'No answer selected';
      const correctOptText = (correctIdx >= 0 && correctIdx < cleanOptions.length) ? cleanOptions[correctIdx] : '';

      review.push({
        questionId: qId,
        questionText: qText,
        concept: q.concept || (topicObj ? topicObj.name : 'Core Principles'),
        options: cleanOptions,
        choices: cleanOptions,
        answers: cleanOptions,
        userSelected: userVal,
        selectedOptionIndex: userVal,
        selectedOptionText: selectedOptText,
        correctIndex: correctIdx,
        correctOptionIndex: correctIdx,
        correctOptionText: correctOptText,
        isCorrect,
        explanation: q.explanation || 'Review core documentation and foundational syntax for this concept.'
      });
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;
    const topicsToImprove = Array.from(topicsToImproveSet);

    // Classifications and Encouraging Feedback
    let classification = 'Needs Improvement';
    let encouragingFeedback = '';
    let recommendation = '';
    const skillName = topicObj ? topicObj.name : assessmentTitle.split('&')[0].trim();

    const topicsPhrase = topicsToImprove.length > 0
      ? `focusing on ${topicsToImprove.slice(0, 3).join(', ')}`
      : 'solidifying your conceptual mastery';

    if (score >= 4) {
      classification = 'Strong Foundation';
      encouragingFeedback = 'Outstanding performance! You have demonstrated strong foundational command of this skill.';
      recommendation = `You have strong competency in ${skillName}. Continue with advanced challenges and hands-on portfolio projects.`;
    } else if (score >= 2) {
      classification = 'Developing';
      encouragingFeedback = 'Good effort! You have solid baseline knowledge and are making good progress.';
      recommendation = `Keep practicing ${skillName} by ${topicsPhrase}. Review the explanations below and try short practice exercises.`;
    } else {
      classification = 'Needs Improvement';
      encouragingFeedback = 'Every expert started where you are today. Use this assessment as your learning guide!';
      recommendation = `Recommended next step: review core ${skillName} concepts, ${topicsPhrase}, using interactive tutorials and guided practice.`;
    }

    // Persist assessment result in MongoDB
  const result = await AssessmentResult.create({
    user: req.user.id,
    assessment: assessment ? assessment._id : undefined,

    topic: topicKey,
    skillName,
    type: 'regular',
    assessmentTitle,

    score,
    totalQuestions,
    correctAnswersCount: score,
    percentage,
    passingThreshold: passingPercentage,
    passed,

    verificationStatus: passed ? 'VERIFIED' : 'NOT VERIFIED',

    identifiedLevel: score >= 4
      ? 'Advanced'
      : score >= 2
        ? 'Intermediate'
        : 'Beginner',

    classification,
    encouragingFeedback,
    recommendation,
    topicsToImprove,
    answers: review
});

    // If passed (score >= 60%), update student profile skill verification
    if (passed) {
      const user = await User.findById(req.user.id);
      if (user) {
        const skillKeyword = skillName.toLowerCase();
        const embeddedIdx = user.skills.findIndex(s => s.name.toLowerCase().includes(skillKeyword) || skillKeyword.includes(s.name.toLowerCase()));
        if (embeddedIdx > -1) {
          user.skills[embeddedIdx].isVerified = true;
          user.skills[embeddedIdx].rating = Math.max(user.skills[embeddedIdx].rating || 0, 4);
          user.skills[embeddedIdx].proficiency = 'Advanced';
        } else {
          user.skills.push({
            name: skillName,
            category: assessment ? assessment.skillCategory : 'Technical',
            proficiency: 'Advanced',
            rating: 4,
            isVerified: true
          });
        }
        await user.save();

        await Skill.updateMany(
          { user: req.user.id, normalizedName: { $regex: skillKeyword, $options: 'i' } },
          { isVerified: true, rating: 4, proficiency: 'Advanced' }
        );
      }
    }

    // Log Activity
    await Activity.create({
      user: req.user.id,
      text: `Completed ${assessmentTitle} Practice Assessment: ${score}/${totalQuestions} (${percentage}%)`,
      icon: passed ? 'bi-patch-check-fill' : 'bi-clipboard-check',
      color: passed ? '#10B981' : '#F59E0B'
    });

    res.status(200).json({
      success: true,
      result: {
        _id: result._id,
        assessmentTitle,
        topic: topicKey,
        score,
        totalQuestions,
        percentage,
        passed,
        passingPercentage,
        classification,
        encouragingFeedback,
        recommendation,
        topicsToImprove,
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
    const results = await AssessmentResult.find({
      user: req.user.id,
      type: { $ne: 'entrance' },
      isEntranceAssessment: { $ne: true }
    }).sort({ completedAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: results.length, 
      results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment results.' });
  }
};

/**
 * @desc    Get a single assessment result attempt with full answer review
 * @route   GET /api/assessments/results/:id
 * @access  Private
 */
exports.getAssessmentResultById = async (req, res) => {
  try {
    const result = await AssessmentResult.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Assessment result not found.' });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assessment details.' });
  }
};
