/**
 * scripts/test-practice-options-visibility.js
 * End-to-end test verifying answer option text visibility, HTML escaping,
 * and data flow across all 12 practice assessment skills.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { topics, questions, getQuestionsByTopic } = require('../data/questions');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');

function getOptionText(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') {
    return String(opt.text || opt.option || opt.optionText || opt.choice || opt.value || opt.label || JSON.stringify(opt));
  }
  return String(opt);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? getOptionText(value) : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Unescape helper to simulate browser textContent after parsing innerHTML
function simulatedDomTextContent(htmlStr) {
  return htmlStr
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
}

async function runTests() {
  console.log('--- STARTING PRACTICE ASSESSMENTS OPTIONS VISIBILITY TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${message}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge_db');
  console.log('Connected to MongoDB.');

  // Test 1: Validate static question bank
  console.log('\nTest Suite 1: Static Question Bank Integrity');
  assert(topics.length === 12, `12 skills defined (found ${topics.length})`);
  assert(questions.length === 60, `60 questions in total (found ${questions.length})`);

  // Test 2: Trigger backend sync
  console.log('\nTest Suite 2: Sync Assessment Catalog to MongoDB');
  const assessmentController = require('../controllers/assessmentController');
  // Call controller getAssessments logic through mock req/res
  const mockReq = { user: { id: new mongoose.Types.ObjectId() } };
  let catalogResult = null;
  const mockRes = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { catalogResult = data; return this; }
  };

  await assessmentController.getAssessments(mockReq, mockRes);
  assert(catalogResult && catalogResult.success === true, 'getAssessments API returns success');
  assert(catalogResult && catalogResult.count === 12, `getAssessments returns 12 practice assessments (found ${catalogResult ? catalogResult.count : 0})`);

  // Test 3: Verify each of the 12 skills
  console.log('\nTest Suite 3: Verify All 12 Skills (5 Questions, 4 Options Each, No Blank Options)');
  
  for (const t of topics) {
    console.log(`\n  Checking Skill: [${t.displayName || t.name}] (id: ${t.id})`);
    
    // Fetch single assessment as student would
    let singleResult = null;
    const singleRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { singleResult = data; return this; }
    };
    await assessmentController.getAssessmentById({ params: { id: t.id }, user: mockReq.user }, singleRes);
    
    assert(singleResult && singleResult.success === true, `Loaded assessment for ${t.id}`);
    const quiz = singleResult ? singleResult.assessment : null;
    assert(quiz && Array.isArray(quiz.questions), `Questions array present for ${t.id}`);
    assert(quiz && quiz.questions.length === 5, `Exactly 5 questions for ${t.id} (found ${quiz ? quiz.questions.length : 0})`);

    // Verify all 5 questions and their 4 options
    for (let qIdx = 0; qIdx < (quiz ? quiz.questions.length : 0); qIdx++) {
      const q = quiz.questions[qIdx];
      assert(q.questionText && q.questionText.trim().length > 0, `Q${qIdx + 1} has non-empty questionText`);
      
      const rawOptions = q.options || q.choices || q.answers || [];
      assert(Array.isArray(rawOptions) && rawOptions.length === 4, `Q${qIdx + 1} has exactly 4 options (found ${rawOptions.length})`);
      
      // Test frontend rendering logic on each option
      for (let optIdx = 0; optIdx < rawOptions.length; optIdx++) {
        const opt = rawOptions[optIdx];
        const optText = getOptionText(opt);
        assert(optText && optText.trim().length > 0, `Q${qIdx + 1} Opt ${['A','B','C','D'][optIdx]} text is not empty: "${optText.substring(0, 30)}"`);
        
        // Check escaping
        const escaped = escapeHtml(optText);
        // Simulated DOM textContent
        const visibleText = simulatedDomTextContent(escaped);
        assert(visibleText === optText, `Q${qIdx + 1} Opt ${['A','B','C','D'][optIdx]} visible text matches source text without disappearing`);
      }
    }

    // Submit answers and check evaluation
    let submitResult = null;
    const submitRes = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { submitResult = data; return this; }
    };
    await assessmentController.submitAssessment({
      params: { id: quiz._id.toString() },
      body: { answers: [0, 1, 2, 3, 0] },
      user: mockReq.user
    }, submitRes);

    assert(submitResult && submitResult.success === true, `Submission successful for ${t.id}`);
    const evalResult = submitResult ? submitResult.result : null;
    assert(evalResult && evalResult.totalQuestions === 5, `Evaluation totalQuestions is 5 for ${t.id}`);
    assert(evalResult && typeof evalResult.score === 'number', `Score calculated: ${evalResult ? evalResult.score : 0}/5`);
    assert(evalResult && Array.isArray(evalResult.review) && evalResult.review.length === 5, `Review contains 5 items for ${t.id}`);

    // Verify review options are not blank
    evalResult.review.forEach((r, rIdx) => {
      assert(r.questionText && r.questionText.trim().length > 0, `Review Q${rIdx + 1} has questionText`);
      assert(Array.isArray(r.options) && r.options.length === 4, `Review Q${rIdx + 1} has 4 options`);
      r.options.forEach((opt, oIdx) => {
        const text = getOptionText(opt);
        assert(text && text.trim().length > 0, `Review Q${rIdx + 1} Option ${['A','B','C','D'][oIdx]} is visible`);
      });
      assert(r.explanation && r.explanation.trim().length > 0, `Review Q${rIdx + 1} has explanation`);
    });
  }

  // Test 4: Explicit check on the HTML DOCTYPE question cited by user
  console.log('\nTest Suite 4: Specific Verification of HTML DOCTYPE Question (html_5)');
  const htmlQuestions = getQuestionsByTopic('html', false);
  const doctypeQ = htmlQuestions.find(q => q.id === 'html_5');
  assert(doctypeQ !== undefined, 'html_5 question found in question bank');
  assert(doctypeQ.options.length === 4, 'DOCTYPE question has 4 options');
  assert(doctypeQ.options[0] === '<!DOCTYPE html>', 'Option A is <!DOCTYPE html>');
  assert(doctypeQ.options[1] === '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">', 'Option B is HTML4 DOCTYPE');
  assert(doctypeQ.options[2] === '<DOCTYPE html5>', 'Option C is <DOCTYPE html5>');
  assert(doctypeQ.options[3] === '<html doctype="5">', 'Option D is <html doctype="5">');

  // Verify escaping for doctype options
  doctypeQ.options.forEach((opt, idx) => {
    const escaped = escapeHtml(opt);
    assert(escaped.includes('&lt;') || escaped.includes('&gt;'), `Option ${['A','B','C','D'][idx]} properly escaped: ${escaped}`);
    assert(simulatedDomTextContent(escaped) === opt, `Option ${['A','B','C','D'][idx]} renders textContent: "${opt}"`);
  });

  // Clean up mock user results created during test
  await AssessmentResult.deleteMany({ user: mockReq.user.id });

  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log(`========================================`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
