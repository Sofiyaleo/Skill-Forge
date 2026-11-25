/**
 * scripts/test-practice-options-visibility.js
 * Comprehensive automated verification for question and options display integrity
 * across all Career Paths and Assessment Categories.
 */

process.env.NODE_ENV = 'test';
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const { topics, getTopicById, getQuestionsByTopic } = require('../data/questions');
const { careers } = require('../data/careers');

let passes = 0;
let fails = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  [PASS] ${msg}`);
    passes++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    fails++;
  }
}

async function verifyAllAssessments() {
  console.log('========================================================================');
  console.log('  VERIFYING PRACTICE ASSESSMENTS & OPTION VISIBILITY ACROSS ALL CAREERS');
  console.log('========================================================================\n');

  await connectDB();

  // 1. Trigger catalog sync
  const assessmentController = require('../controllers/assessmentController');
  // Trigger sync by mocking request to getAssessments
  let syncedAssessments = [];
  const reqMock = {};
  const resMock = {
    status: () => ({
      json: (data) => {
        syncedAssessments = data.assessments;
      }
    })
  };
  await assessmentController.getAssessments(reqMock, resMock);

  console.log('1. Verify Synced Assessment Count & Categories');
  assert(syncedAssessments.length === 15, `Expected 15 total assessments, got ${syncedAssessments.length}`);

  const requiredCategories = [
    'Frontend',
    'Backend',
    'Database',
    'Programming',
    'Core CS',
    'Tools and Platforms',
    'Data & Analytics',
    'Design',
    'Security'
  ];

  const presentCategories = new Set(syncedAssessments.map(a => a.skillCategory));
  requiredCategories.forEach(cat => {
    assert(presentCategories.has(cat), `Category "${cat}" is present in active assessments`);
  });

  // 2. Verify Career Path Coverage
  console.log('\n2. Verify Career Path Practice Assessment Coverage');
  for (const career of careers) {
    console.log(`\n  Checking Career: "${career.title}" (Domain: ${career.category})`);
    let matchedAssessments = 0;
    career.requiredSkills.forEach(reqSkill => {
      const sName = (reqSkill.name || reqSkill).toLowerCase();
      const match = topics.find(t =>
        t.id.toLowerCase() === sName ||
        t.name.toLowerCase() === sName ||
        t.displayName.toLowerCase().includes(sName) ||
        sName.includes(t.name.toLowerCase()) ||
        sName.includes(t.id.toLowerCase())
      );
      if (match) {
        matchedAssessments++;
      }
    });
    assert(matchedAssessments > 0, `Career "${career.title}" has mapped practice assessments (Found ${matchedAssessments} matching skill assessments)`);
  }

  // 3. Deep Question & Option Visibility Audit
  console.log('\n3. Deep Question & Option Visibility Audit for All 15 Assessments');
  const allDbAssessments = await Assessment.find({});

  for (const dbAsmt of allDbAssessments) {
    console.log(`\n  Topic: [${dbAsmt.topic}] "${dbAsmt.title}" (Category: ${dbAsmt.skillCategory})`);
    assert(Array.isArray(dbAsmt.questions) && dbAsmt.questions.length === 5, `  Has exactly 5 questions (actual: ${dbAsmt.questions.length})`);

    dbAsmt.questions.forEach((q, qIdx) => {
      const qNum = qIdx + 1;
      assert(typeof q.questionText === 'string' && q.questionText.trim().length > 0, `  Q${qNum} has non-empty questionText`);
      assert(Array.isArray(q.options) && q.options.length === 4, `  Q${qNum} has exactly 4 options`);

      let allOptsValid = true;
      let optTexts = [];
      q.options.forEach((opt, oIdx) => {
        if (typeof opt !== 'string' || opt.trim().length === 0) {
          allOptsValid = false;
        }
        optTexts.push(opt);
      });
      assert(allOptsValid, `  Q${qNum} all 4 options are non-empty valid strings`);

      // Verify no duplicates
      const uniqueOpts = new Set(optTexts.map(o => o.toLowerCase()));
      assert(uniqueOpts.size === 4, `  Q${qNum} all 4 options are distinct (no duplicate options)`);

      // Verify correct answer is within 0..3
      assert(typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3, `  Q${qNum} correctOptionIndex (${q.correctOptionIndex}) is in bounds (0..3)`);
      assert(typeof q.explanation === 'string' && q.explanation.trim().length > 0, `  Q${qNum} has non-empty explanation`);
    });
  }

  // 4. Test Single Assessment Retrieval & Sanitization
  console.log('\n4. Test API Retrieval Sanitization (getAssessmentById)');
  for (const asmt of syncedAssessments) {
    let deliveredData = null;
    const reqGet = { params: { id: asmt._id } };
    const resGet = {
      status: (code) => ({
        json: (data) => { deliveredData = data; }
      })
    };
    await assessmentController.getAssessmentById(reqGet, resGet);
    assert(deliveredData && deliveredData.success === true, `Successfully retrieved assessment ${asmt.topic}`);
    assert(deliveredData.assessment.questions.length === 5, `Assessment ${asmt.topic} delivered exactly 5 questions`);
    deliveredData.assessment.questions.forEach((q, qIdx) => {
      assert(q.options.length === 4, `Assessment ${asmt.topic} Q${qIdx + 1} delivered 4 options`);
      assert(q.correctOptionIndex === undefined, `Assessment ${asmt.topic} Q${qIdx + 1} does not leak correct answer`);
      assert(q.explanation === undefined, `Assessment ${asmt.topic} Q${qIdx + 1} does not leak explanation`);
    });
  }

  // 5. Test Submission & Review Generation
  console.log('\n5. Test Submission & Detailed Review Generation');
  const testStudent = await User.findOne({ role: 'student' }) || await User.create({
    name: 'Audit Student',
    email: 'audit.student@skillforge.local',
    password: 'Password123!',
    role: 'student'
  });

  const testTarget = syncedAssessments[0];
  let submitOutput = null;
  const reqSub = {
    user: { id: testStudent._id },
    params: { id: testTarget._id },
    body: { answers: [0, 1, 2, 3, 0] }
  };
  const resSub = {
    status: (code) => ({
      json: (data) => { submitOutput = data; }
    })
  };
  await assessmentController.submitAssessment(reqSub, resSub);

  assert(submitOutput && submitOutput.success === true, 'Submission processed successfully');
  assert(submitOutput.result.review.length === 5, 'Submission returns 5 detailed question reviews');
  submitOutput.result.review.forEach((r, idx) => {
    assert(r.options.length === 4, `Review Q${idx + 1} maintains all 4 option strings for student review`);
    assert(typeof r.explanation === 'string' && r.explanation.length > 0, `Review Q${idx + 1} contains concept explanation`);
  });

  await mongoose.disconnect();

  console.log('\n========================================================================');
  console.log(`  PRACTICE OPTION VISIBILITY AUDIT: ${passes} PASSED, ${fails} FAILED`);
  console.log('========================================================================');

  process.exit(fails > 0 ? 1 : 0);
}

verifyAllAssessments().catch(err => {
  console.error(err);
  process.exit(1);
});
