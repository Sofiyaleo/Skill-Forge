/**
 * scripts/test-additional-skill-verification.js
 * Verification test suite for:
 * 1. Adding a new skill from Profile/Dashboard
 * 2. Duplicate prevention
 * 3. Enforcing 'Unassessed' and isVerified: false upon addition
 * 4. Delivering 5 progressive sanitized entrance assessment questions for the single skill
 * 5. Automatic skill level identification (Beginner / Intermediate / Advanced)
 * 6. Saving AssessmentResult in MongoDB (type: 'entrance')
 * 7. Updating student profile and Skill collection
 * 8. Immediate reflection on Student Dashboard metrics & Skill Gap Analysis
 * 9. Handling incomplete/abandoned assessments gracefully
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
const studentController = require('../controllers/studentController');
const entranceController = require('../controllers/entranceAssessmentController');

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

// Mock Express response helper
function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
      return this;
    }
  };
}

async function runSuite() {
  console.log('================================================================');
  console.log('  TEST SUITE: ADDITIONAL SKILL ENTRANCE VERIFICATION WORKFLOW   ');
  console.log('================================================================\n');

  try {
    await connectDB();
    console.log('Database connected.\n');

    // Clean up any previous test user
    const testEmail = 'test_verify_student_' + Date.now() + '@skillforge.test';
    let testUser = await User.create({
      name: 'Verification Test Student',
      email: testEmail,
      password: 'Password123!',
      role: 'student',
      targetCareer: 'Data Analyst',
      entranceAssessmentCompleted: true,
      entranceAssessmentStatus: 'completed',
      skills: [
        {
          name: 'SQL',
          normalizedName: 'sql',
          category: 'Database',
          proficiency: 'Advanced',
          rating: 4,
          isVerified: true,
          verificationScore: 80,
          verificationDate: new Date()
        }
      ]
    });

    await Skill.create({
      user: testUser._id,
      name: 'SQL',
      normalizedName: 'sql',
      category: 'Database',
      proficiency: 'Advanced',
      rating: 4,
      isVerified: true,
      verificationScore: 80,
      verificationDate: new Date()
    });

    console.log('--- TEST 1: Add Skill Validation & Verification Requirement ---');
    // Test 1.1: Empty skill name rejected
    {
      const req = { user: { id: testUser._id }, body: { name: '   ' } };
      const res = createMockRes();
      await studentController.addSkill(req, res);
      assert(res.statusCode === 400, 'Empty skill name returns HTTP 400');
      assert(res.data && res.data.success === false, 'Empty skill name response has success: false');
    }

    // Test 1.2: Duplicate skill rejected
    {
      const req = { user: { id: testUser._id }, body: { name: 'SQL' } };
      const res = createMockRes();
      await studentController.addSkill(req, res);
      assert(res.statusCode === 400, 'Adding duplicate existing skill returns HTTP 400');
      assert(res.data && res.data.message.includes('already exists'), 'Duplicate error message informs user');
    }

    // Test 1.3: Add new skill 'Python' - must be Unassessed & isVerified: false
    let newSkillData = null;
    {
      const req = { user: { id: testUser._id }, body: { name: 'Python', category: 'Programming' } };
      const res = createMockRes();
      await studentController.addSkill(req, res);
      assert(res.statusCode === 201, 'Adding new skill returns HTTP 201 Created');
      assert(res.data && res.data.requireVerification === true, 'Response requires entrance verification');
      assert(res.data && res.data.verificationUrl.includes('entrance-assessment.html?skill=Python'), 'Verification URL is provided');
      assert(res.data && res.data.skill.proficiency === 'Unassessed', 'New skill proficiency is strictly Unassessed');
      assert(res.data && res.data.skill.isVerified === false, 'New skill isVerified is strictly false');
      newSkillData = res.data.skill;
    }

    console.log('\n--- TEST 2: Incomplete / Abandoned Assessment Graceful Handling ---');
    // If student leaves without completing, skill remains in DB as Unassessed & isVerified: false
    {
      const skillInDb = await Skill.findOne({ user: testUser._id, normalizedName: 'python' });
      assert(skillInDb !== null, 'Skill is persisted in Skill collection');
      assert(skillInDb.proficiency === 'Unassessed', 'Persisted proficiency is Unassessed before assessment');
      assert(skillInDb.isVerified === false, 'Persisted isVerified is false before assessment');

      const userInDb = await User.findById(testUser._id);
      const userSkill = userInDb.skills.find(s => s.name.toLowerCase() === 'python');
      assert(userSkill !== undefined, 'Skill is persisted in user.skills');
      assert(userSkill.proficiency === 'Unassessed', 'user.skills proficiency is Unassessed');
      assert(userSkill.isVerified === false, 'user.skills isVerified is false');

      // Dashboard stats with unassessed skill
      const req = { user: { id: testUser._id } };
      const res = createMockRes();
      await studentController.getDashboardStats(req, res);
      assert(res.statusCode === 200, 'Dashboard loads successfully with unassessed skill');
      const unassessed = res.data.verifiedSkillsSection.unassessedSkills;
      assert(unassessed.some(u => u.name === 'Python'), 'Python appears under unassessed skills in dashboard');
    }

    console.log('\n--- TEST 3: Single-Skill Entrance Questions Endpoint ---');
    // GET /api/entrance-assessment/questions?skill=Python
    {
      const req = { user: { id: testUser._id }, query: { skill: 'Python' } };
      const res = createMockRes();
      await entranceController.getAssessmentQuestions(req, res);
      assert(res.statusCode === 200, 'Single skill questions endpoint returns HTTP 200');
      assert(res.data.isSingleSkillVerification === true, 'Response indicates isSingleSkillVerification: true');
      assert(res.data.totalSkills === 1, 'Total skills is exactly 1');
      assert(res.data.assessments.length === 1, 'Assessments array contains exactly 1 skill');

      const pyAssessment = res.data.assessments[0];
      assert(pyAssessment.skillName === 'Python', 'Assessment is for Python');
      assert(pyAssessment.totalQuestions === 5, 'Python assessment has exactly 5 questions');
      assert(pyAssessment.questions.length === 5, 'Questions array has 5 items');
      assert(pyAssessment.questions.every(q => q.options && q.options.length === 4), 'All 5 questions have 4 options');
      assert(pyAssessment.questions.every(q => q.correctOptionIndex === undefined), 'Correct answers are not exposed in questions');
    }

    console.log('\n--- TEST 4: Single-Skill Entrance Assessment Submission & Evaluation ---');
    // Submit 5 answers for Python (5 correct = Advanced)
    {
      // In entranceQuestionBank, correctOptionIndex is 0 for each question
      const pythonAnswers = [0, 0, 0, 0, 0]; // 5/5 correct -> Advanced
      const req = {
        user: { id: testUser._id },
        body: {
          submissions: {
            'Python': pythonAnswers
          }
        }
      };
      const res = createMockRes();
      await entranceController.submitAssessment(req, res);
      assert(res.statusCode === 200, 'Submit single skill assessment returns HTTP 200');
      assert(res.data.success === true, 'Submission successful');
      assert(res.data.results.length === 1, 'Result returned for 1 skill');

      const r = res.data.results[0];
      assert(r.skillName === 'Python', 'Result skill name is Python');
      assert(r.score === 5, 'Score is 5/5');
      assert(r.percentage === 100, 'Percentage is 100%');
      assert(r.identifiedLevel === 'Advanced', 'Identified level is Advanced');
      assert(r.passed === true, 'Assessment passed');
      assert(r.verificationStatus === 'VERIFIED', 'Verification status is VERIFIED');

      // Check AssessmentResult record saved in MongoDB with type 'entrance'
      const savedResultDoc = await AssessmentResult.findOne({
        user: testUser._id,
        type: 'entrance',
        skillName: 'Python'
      });
      assert(savedResultDoc !== null, 'AssessmentResult saved in MongoDB with type: entrance');
      assert(savedResultDoc.score === 5, 'MongoDB AssessmentResult score is 5');
      assert(savedResultDoc.identifiedLevel === 'Advanced', 'MongoDB AssessmentResult level is Advanced');
      assert(savedResultDoc.passed === true, 'MongoDB AssessmentResult passed is true');
    }

    console.log('\n--- TEST 5: Database Updates & Reflection on Student Profile ---');
    // Check Skill collection & User.skills updated
    {
      const updatedSkill = await Skill.findOne({ user: testUser._id, normalizedName: 'python' });
      assert(updatedSkill.isVerified === true, 'Skill collection isVerified updated to true');
      assert(updatedSkill.proficiency === 'Advanced', 'Skill collection proficiency updated to Advanced');
      assert(updatedSkill.rating >= 4, 'Skill collection rating updated to Advanced (rating >= 4)');
      assert(updatedSkill.verificationScore === 100, 'Skill collection verificationScore is 100');
      assert(updatedSkill.verificationDate !== null, 'Skill collection verificationDate is recorded');

      const updatedUser = await User.findById(testUser._id);
      const userPy = updatedUser.skills.find(s => s.name.toLowerCase() === 'python');
      assert(userPy.isVerified === true, 'User.skills isVerified updated to true');
      assert(userPy.proficiency === 'Advanced', 'User.skills proficiency updated to Advanced');
      assert(userPy.rating >= 4, 'User.skills rating updated to Advanced (rating >= 4)');
      assert(userPy.verificationScore === 100, 'User.skills verificationScore is 100');
    }

    console.log('\n--- TEST 6: Dashboard Metrics & Skill Gap Reflection ---');
    {
      const req = { user: { id: testUser._id } };
      const res = createMockRes();
      await studentController.getDashboardStats(req, res);
      assert(res.statusCode === 200, 'Dashboard loaded successfully');

      const sec = res.data.verifiedSkillsSection;
      assert(sec.verifiedSkills.some(s => s.name === 'Python'), 'Python is in verifiedSkills list');
      assert(sec.unassessedSkills.every(s => s.name !== 'Python'), 'Python is no longer in unassessedSkills list');
      assert(sec.mySkillLevels.some(s => s.name === 'Python' && s.identifiedLevel === 'Advanced'), 'My Skill Levels shows Python as Advanced');

      // Check Skill Gap Analysis: Python is one of Full Stack Developer skills
      const gap = res.data.gapAnalysis;
      assert(gap.matchedSkills.some(s => s.name.toLowerCase().includes('python')), 'Python reflected in Skill Gap matchedSkills');
    }

    console.log('\n--- TEST 7: Beginner / Not Verified Level (0-1 correct) ---');
    // Add skill 'Docker' and score 1/5 -> Beginner (rating 1, isVerified: false)
    {
      const addReq = { user: { id: testUser._id }, body: { name: 'Docker', category: 'Tools and Platforms' } };
      const addRes = createMockRes();
      await studentController.addSkill(addReq, addRes);
      assert(addRes.statusCode === 201, 'Docker skill added');

      // Submit only 1 correct answer (score = 1)
      const subReq = {
        user: { id: testUser._id },
        body: {
          submissions: {
            'Docker': [1, -1, -1, -1, -1] // 1 question answered
          }
        }
      };
      const subRes = createMockRes();
      await entranceController.submitAssessment(subReq, subRes);
      assert(subRes.statusCode === 200, 'Docker assessment submitted');

      const dockerResult = subRes.data.results[0];
      assert(dockerResult.identifiedLevel === 'Beginner', 'Identified level for 1/5 is Beginner');
      assert(dockerResult.passed === false, 'Score 1/5 does not pass verification baseline');
      assert(dockerResult.verificationStatus === 'NOT VERIFIED', 'Verification status is NOT VERIFIED');

      const dockerSkillInDb = await Skill.findOne({ user: testUser._id, normalizedName: 'docker' });
      assert(dockerSkillInDb.isVerified === false, 'Docker isVerified remains false');
      assert(dockerSkillInDb.proficiency === 'Beginner', 'Docker proficiency is Beginner');
      assert(dockerSkillInDb.rating === 1, 'Docker rating is 1');
    }

    console.log('\n--- TEST 8: Dedicated Single-Skill Verification Route /verify/:skillName ---');
    // Retake / verify Docker using POST /api/entrance-assessment/verify/:skillName
    {
      // Answer 3 correct out of 5 -> Intermediate, passed: true
      // In dynamic questions for Docker, correctOptionIndex is 0
      const req = {
        user: { id: testUser._id },
        params: { skillName: 'Docker' },
        body: {
          answers: [0, 0, 0, 1, 1] // 3 correct out of 5
        }
      };
      const res = createMockRes();
      await entranceController.verifySingleSkill(req, res);
      assert(res.statusCode === 200, 'verifySingleSkill returns HTTP 200');
      assert(res.data.result.identifiedLevel === 'Intermediate', 'Identified level for 3/5 is Intermediate');
      assert(res.data.result.passed === true, 'Passed is true for Intermediate');

      const verifiedDocker = await Skill.findOne({ user: testUser._id, normalizedName: 'docker' });
      assert(verifiedDocker.isVerified === true, 'Docker now updated to isVerified: true');
      assert(verifiedDocker.proficiency === 'Intermediate', 'Docker proficiency updated to Intermediate');
      assert(verifiedDocker.rating === 3, 'Docker rating updated to 3');
    }

    // Clean up test user & skills
    await User.findByIdAndDelete(testUser._id);
    await Skill.deleteMany({ user: testUser._id });
    await AssessmentResult.deleteMany({ user: testUser._id });
    console.log('\nCleaned up test data.');

  } catch (err) {
    console.error('Test Suite Error:', err);
    failedTests++;
  } finally {
    await mongoose.disconnect();
    console.log('\n================================================================');
    console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('================================================================');
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runSuite();
