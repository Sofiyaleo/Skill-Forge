/**
 * scripts/test-entrance-assessment.js
 * Comprehensive automated verification script for Student Entrance Assessment
 * and Automatic Skill Level Identification feature.
 */

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const AssessmentResult = require('../models/AssessmentResult');
const {
  getQuestionsForSkill,
  evaluateSkillSubmission,
  calculateSkillLevel,
  SKILL_LEVEL_THRESHOLDS
} = require('../data/entranceQuestions');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runSuite() {
  console.log('================================================================');
  console.log('  ENTRANCE ASSESSMENT & AUTOMATIC SKILL LEVEL IDENTIFICATION TEST');
  console.log('================================================================\n');

  try {
    await connectDB();
    console.log('Database connected.\n');

    // -------------------------------------------------------------------------
    // TEST 1: Question Bank Sanitization & 5-Question Progressive Structure
    // -------------------------------------------------------------------------
    console.log('TEST 1: Question Bank Sanitization & 5-Question Structure');
    const htmlSanitized = getQuestionsForSkill('HTML', true);
    assert(htmlSanitized.totalQuestions === 5, 'HTML has exactly 5 questions');
    assert(htmlSanitized.questions.length === 5, 'HTML returned 5 questions in array');
    
    // Check no answers or explanations exposed in sanitized mode
    const hasLeak = htmlSanitized.questions.some(q => q.correctOptionIndex !== undefined || q.explanation !== undefined);
    assert(!hasLeak, 'Sanitized questions strictly DO NOT leak correct answers or explanations');
    assert(htmlSanitized.questions.every(q => q.options && q.options.length === 4), 'Every question has exactly 4 answer options');

    const cssSanitized = getQuestionsForSkill('CSS', true);
    assert(cssSanitized.totalQuestions === 5, 'CSS has exactly 5 questions');

    const jsSanitized = getQuestionsForSkill('JavaScript', true);
    assert(jsSanitized.totalQuestions === 5, 'JavaScript has exactly 5 questions');

    const pySanitized = getQuestionsForSkill('Python', true);
    assert(pySanitized.totalQuestions === 5, 'Python has exactly 5 questions');

    // -------------------------------------------------------------------------
    // TEST 2: Automatic Skill Level Identification Scoring Logic
    // -------------------------------------------------------------------------
    console.log('\nTEST 2: Automatic Skill Level Identification Logic (0-1: Beginner, 2-3: Intermediate, 4-5: Advanced)');
    assert(calculateSkillLevel(0) === 'Beginner', 'Score 0/5 is identified as Beginner');
    assert(calculateSkillLevel(1) === 'Beginner', 'Score 1/5 is identified as Beginner');
    assert(calculateSkillLevel(2) === 'Intermediate', 'Score 2/5 is identified as Intermediate');
    assert(calculateSkillLevel(3) === 'Intermediate', 'Score 3/5 is identified as Intermediate');
    assert(calculateSkillLevel(4) === 'Advanced', 'Score 4/5 is identified as Advanced');
    assert(calculateSkillLevel(5) === 'Advanced', 'Score 5/5 is identified as Advanced');

    // Test evaluateSkillSubmission for HTML, CSS, JavaScript
    // Correct answers in bank are:
    // HTML: [0, 0, 1, 0, 0]
    // CSS:  [0, 0, 0, 0, 0]
    // JS:   [0, 0, 0, 0, 0]
    const html4 = evaluateSkillSubmission('HTML', [0, 0, 1, 0, -1]); // 4 correct -> Advanced
    assert(html4.score === 4 && html4.totalQuestions === 5 && html4.identifiedLevel === 'Advanced', 'HTML 4/5 identifies Advanced level');

    const css2 = evaluateSkillSubmission('CSS', [0, 0, -1, -1, -1]); // 2 correct -> Intermediate
    assert(css2.score === 2 && css2.totalQuestions === 5 && css2.identifiedLevel === 'Intermediate', 'CSS 2/5 identifies Intermediate level');

    const js1 = evaluateSkillSubmission('JavaScript', [0, -1, -1, -1, -1]); // 1 correct -> Beginner
    assert(js1.score === 1 && js1.totalQuestions === 5 && js1.identifiedLevel === 'Beginner', 'JavaScript 1/5 identifies Beginner level');

    // -------------------------------------------------------------------------
    // TEST 3: Student Registration Simulation & Initial Assessment Status
    // -------------------------------------------------------------------------
    console.log('\nTEST 3: Student Registration Simulation & Initial State (Unassessed)');
    const testEmail = `test_student_level_${Date.now()}@skillforge.test`;
    
    // Create new student with claimed skills (HTML, CSS, JavaScript) without self-selected levels
    const newStudent = await User.create({
      name: 'John Student',
      email: testEmail,
      password: 'password123',
      role: 'student',
      targetCareer: 'Full Stack Developer',
      careerInterest: 'Full Stack Developer',
      entranceAssessmentCompleted: false,
      entranceAssessmentStatus: 'not_started',
      skills: [
        { name: 'HTML', normalizedName: 'html', category: 'Web Development', proficiency: 'Unassessed', rating: 1, isVerified: false },
        { name: 'CSS', normalizedName: 'css', category: 'Web Development', proficiency: 'Unassessed', rating: 1, isVerified: false },
        { name: 'JavaScript', normalizedName: 'javascript', category: 'Programming', proficiency: 'Unassessed', rating: 1, isVerified: false }
      ]
    });

    for (const sk of newStudent.skills) {
      await Skill.create({
        user: newStudent._id,
        name: sk.name,
        normalizedName: sk.normalizedName,
        category: sk.category,
        proficiency: 'Unassessed',
        rating: 1,
        isVerified: false
      });
    }

    assert(newStudent.entranceAssessmentCompleted === false, 'Newly registered student has entranceAssessmentCompleted = false');
    assert(newStudent.skills.every(s => s.proficiency === 'Unassessed'), 'All claimed skills initially have proficiency = "Unassessed"');

    // -------------------------------------------------------------------------
    // TEST 4: Partial Progress Save & Resuming Incomplete Assessments
    // -------------------------------------------------------------------------
    console.log('\nTEST 4: Incomplete Assessment Progress & Resuming');
    newStudent.entranceAssessmentStatus = 'in_progress';
    newStudent.entranceAssessmentProgress = {
      currentSkillIndex: 1,
      completedSkillNames: ['HTML'],
      savedAnswers: {
        'HTML': [0, 0, 1, 0, 0],
        'CSS': [0, 2, -1, -1, -1]
      }
    };
    await newStudent.save();

    const fetchedForResume = await User.findById(newStudent._id);
    assert(fetchedForResume.entranceAssessmentStatus === 'in_progress', 'Status correctly shows in_progress when partial answers saved');
    assert(fetchedForResume.entranceAssessmentProgress.currentSkillIndex === 1, 'Current skill index is preserved for resuming');
    assert(fetchedForResume.entranceAssessmentProgress.savedAnswers.HTML.length === 5, 'Saved answers for HTML preserved for resuming');

    // -------------------------------------------------------------------------
    // TEST 5: Entrance Assessment Submission & Automatic Level Persistence
    // -------------------------------------------------------------------------
    console.log('\nTEST 5: Entrance Assessment Submission & Automatic Level Persistence');
    // Student finishes:
    // HTML: 4/5 -> Advanced
    // CSS: 2/5 -> Intermediate
    // JavaScript: 1/5 -> Beginner
    const results = [
      { skill: 'HTML', eval: html4 },
      { skill: 'CSS', eval: css2 },
      { skill: 'JavaScript', eval: js1 }
    ];

    for (const item of results) {
      await AssessmentResult.create({
        user: newStudent._id,
        skillName: item.skill,
        topic: item.eval.normalizedKey,
        type: 'entrance',
        score: item.eval.score,
        totalQuestions: 5,
        correctAnswersCount: item.eval.score,
        percentage: item.eval.percentage,
        identifiedLevel: item.eval.identifiedLevel,
        passed: item.eval.passed,
        verificationStatus: item.eval.verificationStatus,
        attemptNumber: 1,
        answers: item.eval.review
      });

      // Update skill model
      const rating = item.eval.identifiedLevel === 'Advanced' ? 5 : (item.eval.identifiedLevel === 'Intermediate' ? 3 : 1);
      const skIdx = newStudent.skills.findIndex(s => s.name.toLowerCase() === item.skill.toLowerCase());
      if (skIdx > -1) {
        newStudent.skills[skIdx].proficiency = item.eval.identifiedLevel;
        newStudent.skills[skIdx].isVerified = item.eval.passed;
        newStudent.skills[skIdx].rating = rating;
      }

      await Skill.updateOne(
        { user: newStudent._id, normalizedName: item.eval.normalizedKey },
        { proficiency: item.eval.identifiedLevel, isVerified: item.eval.passed, rating }
      );
    }

    newStudent.entranceAssessmentCompleted = true;
    newStudent.entranceAssessmentStatus = 'completed';
    newStudent.entranceAssessmentDate = new Date();
    await newStudent.save();

    const verifiedStudent = await User.findById(newStudent._id);
    assert(verifiedStudent.entranceAssessmentCompleted === true, 'Student marked entranceAssessmentCompleted = true');
    assert(verifiedStudent.skills.find(s => s.name === 'HTML').proficiency === 'Advanced', 'HTML identified and saved as Advanced');
    assert(verifiedStudent.skills.find(s => s.name === 'CSS').proficiency === 'Intermediate', 'CSS identified and saved as Intermediate');
    assert(verifiedStudent.skills.find(s => s.name === 'JavaScript').proficiency === 'Beginner', 'JavaScript identified and saved as Beginner');

    const dbSkillHTML = await Skill.findOne({ user: newStudent._id, normalizedName: 'html' });
    const dbSkillCSS = await Skill.findOne({ user: newStudent._id, normalizedName: 'css' });
    const dbSkillJS = await Skill.findOne({ user: newStudent._id, normalizedName: 'javascript' });
    assert(dbSkillHTML.proficiency === 'Advanced', 'Skill collection: HTML saved as Advanced');
    assert(dbSkillCSS.proficiency === 'Intermediate', 'Skill collection: CSS saved as Intermediate');
    assert(dbSkillJS.proficiency === 'Beginner', 'Skill collection: JavaScript saved as Beginner');

    // -------------------------------------------------------------------------
    // TEST 6: Retake Workflow to Improve Identified Level
    // -------------------------------------------------------------------------
    console.log('\nTEST 6: Retake Workflow & Level Upgrade (JavaScript 1/5 Beginner -> 4/5 Advanced)');
    // Student retakes JS and scores 4/5 (correct JS: [0, 0, 0, 0, 0])
    const jsRetakeEval = evaluateSkillSubmission('JavaScript', [0, 0, 0, 0, -1]); // 4 correct -> Advanced
    assert(jsRetakeEval.score === 4 && jsRetakeEval.identifiedLevel === 'Advanced', 'Retake achieves 4/5 and identifies Advanced level');

    await AssessmentResult.create({
      user: newStudent._id,
      skillName: 'JavaScript',
      topic: 'javascript',
      type: 'entrance',
      score: jsRetakeEval.score,
      totalQuestions: 5,
      correctAnswersCount: jsRetakeEval.score,
      percentage: jsRetakeEval.percentage,
      identifiedLevel: jsRetakeEval.identifiedLevel,
      passed: true,
      verificationStatus: 'VERIFIED',
      attemptNumber: 2,
      answers: jsRetakeEval.review
    });

    const jsAttempts = await AssessmentResult.countDocuments({ user: newStudent._id, topic: 'javascript' });
    assert(jsAttempts === 2, 'Full attempt history preserved: 2 attempts for JavaScript');

    // Update level on user and skill model
    const jsIdx = newStudent.skills.findIndex(s => s.name === 'JavaScript');
    newStudent.skills[jsIdx].proficiency = 'Advanced';
    newStudent.skills[jsIdx].isVerified = true;
    newStudent.skills[jsIdx].rating = 5;
    await newStudent.save();

    await Skill.updateOne({ user: newStudent._id, normalizedName: 'javascript' }, { proficiency: 'Advanced', isVerified: true, rating: 5 });

    const retakeUpdatedUser = await User.findById(newStudent._id);
    assert(retakeUpdatedUser.skills.find(s => s.name === 'JavaScript').proficiency === 'Advanced', 'JavaScript proficiency updated to Advanced after retake');

    // -------------------------------------------------------------------------
    // TEST 7: Cleanup Test Artifacts
    // -------------------------------------------------------------------------
    await User.findByIdAndDelete(newStudent._id);
    await Skill.deleteMany({ user: newStudent._id });
    await AssessmentResult.deleteMany({ user: newStudent._id });
    console.log('\nTest artifacts cleaned up successfully.');

    console.log('\n================================================================');
    console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(failedTests > 0 ? 1 : 0);

  } catch (err) {
    console.error('Test Suite Error:', err);
    process.exit(1);
  }
}

runSuite();
