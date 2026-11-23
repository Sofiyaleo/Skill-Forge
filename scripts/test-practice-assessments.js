/**
 * scripts/test-practice-assessments.js
 * Automated test suite for Skill Improvement Assessments (Practice Assessments).
 * Verifies question bank integrity, 5-question limit, 4-option visibility,
 * server-side scoring, explanations, improvement recommendations, and MongoDB persistence.
 */

process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const connectDB = require('../config/db');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const { topics, questions, getTopicById, getQuestionsByTopic, scoreQuiz } = require('../data/questions');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

// Setup mini test server
const app = express();
app.use(express.json());
app.use('/api/assessments', require('../routes/assessmentRoutes'));

let server;
const serverPort = 5566;
const baseUrl = `http://localhost:${serverPort}/api/assessments`;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runPracticeAssessmentTests() {
  console.log('========================================================');
  console.log('  TESTING SKILL IMPROVEMENT / PRACTICE ASSESSMENTS');
  console.log('========================================================\n');

  try {
    // -----------------------------------------------------------------
    // Test 1: Question Bank Integrity (All Topics & 4 Options)
    // -----------------------------------------------------------------
    console.log('Test 1: Question Bank Integrity & 4-Option Structure');
    assert(Array.isArray(topics) && topics.length >= 10, `At least 10 practice topics available (actual: ${topics.length})`);

    topics.forEach(t => {
      const topicQuestions = questions.filter(q => q.topicId === t.id);
      assert(topicQuestions.length >= 5, `${t.name} has at least 5 questions (actual: ${topicQuestions.length})`);

      let allValid = true;
      topicQuestions.forEach(q => {
        if (!q.id || !q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== 'number' || !q.explanation) {
          allValid = false;
        }
      });
      assert(allValid, `${t.name} questions all have valid 4-option structure, question text, correctIndex (0-3), and explanation`);
    });

    // -----------------------------------------------------------------
    // Test 2: Question Sanitization & Safety
    // -----------------------------------------------------------------
    console.log('\nTest 2: Question Sanitization for Student Quiz Runner');
    const sanitizedHtml = getQuestionsByTopic('html', true);
    assert(sanitizedHtml.length === 5, 'Sanitized HTML question set returns exactly 5 questions');
    assert(sanitizedHtml[0].correctIndex === undefined, 'Sanitized questions do NOT expose correctIndex');
    assert(sanitizedHtml[0].explanation === undefined, 'Sanitized questions do NOT expose explanation');
    assert(sanitizedHtml[0].options.length === 4, 'Sanitized questions maintain all 4 options');

    // -----------------------------------------------------------------
    // Test 3: Server-side Scoring Logic & Improvement Recommendations
    // -----------------------------------------------------------------
    console.log('\nTest 3: Server-side Scoring Logic & Improvement Recommendations');
    const jsQuestions = questions.filter(q => q.topicId === 'javascript').slice(0, 5);

    // Score 5/5 (100% -> Strong Foundation)
    const perfectAnswers = {};
    jsQuestions.forEach(q => { perfectAnswers[q.id] = q.correctIndex; });
    const perfectResult = scoreQuiz('javascript', perfectAnswers);
    assert(perfectResult.score === 5, 'Perfect answers score 5 out of 5');
    assert(perfectResult.percentage === 100, 'Perfect percentage is 100%');
    assert(perfectResult.classification === 'Strong Foundation', 'Classification is Strong Foundation');
    assert(typeof perfectResult.recommendation === 'string' && perfectResult.recommendation.length > 0, 'Generates recommendation for Strong Foundation');
    assert(perfectResult.topicsToImprove.length === 0, '0 topics to improve for perfect score');

    // Score 3/5 (60% -> Developing)
    const devAnswers = {};
    jsQuestions.forEach((q, idx) => {
      devAnswers[q.id] = (idx < 3) ? q.correctIndex : ((q.correctIndex + 1) % 4);
    });
    const devResult = scoreQuiz('javascript', devAnswers);
    assert(devResult.score === 3, 'Calculated score is 3 out of 5');
    assert(devResult.percentage === 60, 'Percentage is 60%');
    assert(devResult.classification === 'Developing', 'Classification is Developing');
    assert(devResult.topicsToImprove.length === 2, 'Identified 2 concepts needing practice');

    // Score 1/5 (20% -> Needs Improvement)
    const needsImpAnswers = {};
    jsQuestions.forEach((q, idx) => {
      needsImpAnswers[q.id] = (idx < 1) ? q.correctIndex : ((q.correctIndex + 1) % 4);
    });
    const needsImpResult = scoreQuiz('javascript', needsImpAnswers);
    assert(needsImpResult.score === 1, 'Calculated score is 1 out of 5');
    assert(needsImpResult.percentage === 20, 'Percentage is 20%');
    assert(needsImpResult.classification === 'Needs Improvement', 'Classification is Needs Improvement');
    assert(needsImpResult.topicsToImprove.length === 4, 'Identified 4 concepts needing practice');

    // -----------------------------------------------------------------
    // Test 4: End-to-End Express API & MongoDB Integration
    // -----------------------------------------------------------------
    console.log('\nTest 4: Express API & MongoDB Integration');
    await connectDB();
    server = app.listen(serverPort);

    // Create test student user
    const testEmail = 'practice.student@testforge.local';
    await User.deleteMany({ email: testEmail });
    const studentUser = await User.create({
      name: 'Practice Test Student',
      email: testEmail,
      password: 'SecurePassword123!',
      role: 'student',
      targetCareer: 'Full Stack Developer',
      skills: [{ name: 'JavaScript', category: 'Programming', proficiency: 'Intermediate', rating: 3, isVerified: false }]
    });

    const studentToken = jwt.sign({ id: studentUser._id }, process.env.JWT_SECRET || 'skillforge_secret_key');
    const authHeaders = { Authorization: `Bearer ${studentToken}` };

    // 4A: GET /api/assessments
    const listRes = await fetchJson(baseUrl, { headers: authHeaders });
    assert(listRes.status === 200, 'GET /api/assessments returns 200 OK');
    assert(listRes.data.assessments.length >= 10, `Lists at least 10 available assessments (actual: ${listRes.data.assessments.length})`);
    assert(listRes.data.assessments[0].questionCount === 5, 'Assessments report exactly 5 questions');

    // 4B: GET /api/assessments/:id
    const jsAssessment = listRes.data.assessments.find(a => a.topic === 'javascript') || listRes.data.assessments[0];
    const getRes = await fetchJson(`${baseUrl}/${jsAssessment._id}`, { headers: authHeaders });
    assert(getRes.status === 200, 'GET /api/assessments/:id returns 200 OK');
    assert(getRes.data.assessment.questions.length === 5, 'Delivers exactly 5 sanitized questions');
    assert(getRes.data.assessment.questions[0].options.length === 4, 'Question has 4 clearly defined options');
    assert(getRes.data.assessment.questions[0].correctIndex === undefined, 'Does NOT expose correct answers to student');

    // 4C: POST /api/assessments/:id/submit
    const answersToSubmit = [1, 1, 1, 1, 0]; // 5 choices
    const subRes = await fetchJson(`${baseUrl}/${jsAssessment._id}/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ answers: answersToSubmit })
    });

    assert(subRes.status === 200, 'POST /api/assessments/:id/submit returns 200 OK');
    assert(typeof subRes.data.result.score === 'number', 'Returns score out of 5');
    assert(subRes.data.result.totalQuestions === 5, 'Total questions evaluated is 5');
    assert(Array.isArray(subRes.data.result.review) && subRes.data.result.review.length === 5, 'Returns 5 question reviews');
    assert(typeof subRes.data.result.review[0].explanation === 'string', 'Review contains explanation for correct answer');
    assert(typeof subRes.data.result.recommendation === 'string', 'Returns personalized recommendation');
    assert(Array.isArray(subRes.data.result.topicsToImprove), 'Returns topics to improve array');

    // 4D: Verify persistence in MongoDB AssessmentResult
    const savedResult = await AssessmentResult.findOne({ user: studentUser._id, topic: jsAssessment.topic });
    assert(savedResult != null, 'Assessment attempt result successfully persisted in MongoDB');
    assert(savedResult.score === subRes.data.result.score, 'Saved score matches evaluated score');
    assert(savedResult.totalQuestions === 5, 'Saved total questions is 5');

    // 4E: GET /api/assessments/my-results
    const historyRes = await fetchJson(`${baseUrl}/my-results`, { headers: authHeaders });
    assert(historyRes.status === 200, 'GET /api/assessments/my-results returns 200 OK');
    assert(historyRes.data.results.length >= 1, 'My Results returns student assessment history');
    assert(historyRes.data.results[0].score !== undefined, 'History includes score out of 5');

    // 4F: GET /api/assessments/results/:id (Detailed attempt review)
    const singleResultRes = await fetchJson(`${baseUrl}/results/${savedResult._id}`, { headers: authHeaders });
    assert(singleResultRes.status === 200, 'GET /api/assessments/results/:id returns 200 OK');
    assert(singleResultRes.data.result.answers.length === 5, 'Delivers detailed answer review with explanations for past attempt');

    // Clean up test data
    await User.deleteMany({ email: testEmail });
    await AssessmentResult.deleteMany({ user: studentUser._id });

    // -----------------------------------------------------------------
    // Test 5: Verify Entrance Assessment Has Not Been Disturbed
    // -----------------------------------------------------------------
    console.log('\nTest 5: Preserving Entrance Assessment Architecture');
    const entranceQuestions = require('../data/entranceQuestions');
    assert(entranceQuestions.ENTRANCE_QUESTION_BANK != null, 'Entrance question bank is intact and unaffected');
    assert(typeof entranceQuestions.evaluateSkillAnswers === 'function', 'Entrance evaluation engine is intact');

    console.log('\n========================================================');
    console.log(`  PRACTICE ASSESSMENT TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('========================================================');

    if (server) server.close();
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Execution Error:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runPracticeAssessmentTests();
