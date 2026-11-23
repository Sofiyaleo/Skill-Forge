/**
 * scripts/test-api-endpoints.js
 * Tests all Entrance Assessment and Automatic Skill Level Identification API endpoints end-to-end
 * with JWT authentication and real HTTP calls.
 */

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
}

const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Skill = require('../models/Skill');
const AssessmentResult = require('../models/AssessmentResult');

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

async function runApiTests() {
  console.log('================================================================');
  console.log('  ENTRANCE ASSESSMENT & SKILL LEVEL API INTEGRATION TEST');
  console.log('================================================================\n');

  await connectDB();

  // Spin up test server with all routes mounted
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/student', require('../routes/studentRoutes'));
  app.use('/api/entrance-assessment', require('../routes/entranceAssessmentRoutes'));
  app.use('/api/admin', require('../routes/adminRoutes'));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const req = http.request(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    // 1. Create a Student User
    const studentEmail = `student_api_levels_${Date.now()}@skillforge.test`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Priya Patel',
      email: studentEmail,
      password: 'password123',
      targetCareer: 'Full Stack Developer',
      skills: [
        { name: 'HTML5', category: 'Web Development', proficiency: 'Unassessed' },
        { name: 'CSS3', category: 'Web Development', proficiency: 'Unassessed' },
        { name: 'JavaScript', category: 'Programming', proficiency: 'Unassessed' }
      ]
    });

    assert(regRes.status === 201, 'Student registered successfully (201)');
    assert(regRes.body.user.entranceAssessmentCompleted === false, 'Register response includes entranceAssessmentCompleted = false');
    const studentToken = regRes.body.token;
    const studentId = regRes.body.user.id;

    // 2. Test GET /api/entrance-assessment/status
    console.log('\nTesting GET /api/entrance-assessment/status:');
    const statusRes = await request('GET', '/api/entrance-assessment/status', null, studentToken);
    assert(statusRes.status === 200, 'Status returned 200 OK');
    assert(statusRes.body.data.targetCareer === 'Full Stack Developer', 'Status returned correct targetCareer');
    assert(statusRes.body.data.entranceAssessmentCompleted === false, 'Status shows assessment not yet completed');
    assert(statusRes.body.data.skills.length === 3, 'Status returned exactly the 3 claimed skills');

    // 3. Test POST /api/entrance-assessment/progress (Save partial progress for resuming)
    console.log('\nTesting POST /api/entrance-assessment/progress (Incomplete Assessment Resuming):');
    const progressRes = await request('POST', '/api/entrance-assessment/progress', {
      currentSkillIndex: 1,
      completedSkillNames: ['HTML5'],
      savedAnswers: {
        'HTML5': [0, 0, 1, 0, 0],
        'CSS3': [0, 0, -1, -1, -1]
      }
    }, studentToken);
    assert(progressRes.status === 200, 'Progress saved successfully (200 OK)');

    const statusAfterProgress = await request('GET', '/api/entrance-assessment/status', null, studentToken);
    assert(statusAfterProgress.body.data.entranceAssessmentStatus === 'in_progress', 'Status updated to in_progress');
    assert(statusAfterProgress.body.data.entranceAssessmentProgress.currentSkillIndex === 1, 'Current skill index preserved');

    // 4. Test GET /api/entrance-assessment/questions
    console.log('\nTesting GET /api/entrance-assessment/questions:');
    const questionsRes = await request('GET', '/api/entrance-assessment/questions', null, studentToken);
    assert(questionsRes.status === 200, 'Questions returned 200 OK');
    assert(questionsRes.body.totalSkills === 3, 'Questions delivered only for the 3 claimed skills');
    assert(questionsRes.body.assessments[0].questions.length === 5, 'First skill (HTML) contains exactly 5 progressive questions');
    assert(questionsRes.body.assessments[0].totalQuestions === 5, 'Total questions is 5');
    assert(questionsRes.body.assessments[0].questions[0].correctOptionIndex === undefined, 'Correct answers are NOT leaked to client');

    // 5. Test POST /api/entrance-assessment/submit
    console.log('\nTesting POST /api/entrance-assessment/submit (Automatic Skill Level Identification):');
    // HTML5: 4/5 (Advanced)
    // CSS3: 2/5 (Intermediate)
    // JavaScript: 1/5 (Beginner)
    const submitPayload = {
      submissions: {
        'HTML5': [0, 0, 1, 0, -1],      // 4/5 -> Advanced
        'CSS3': [0, 0, -1, -1, -1],       // 2/5 -> Intermediate
        'JavaScript': [0, -1, -1, -1, -1] // 1/5 -> Beginner
      }
    };
    const submitRes = await request('POST', '/api/entrance-assessment/submit', submitPayload, studentToken);
    assert(submitRes.status === 200, 'Submit returned 200 OK');
    
    const htmlResult = submitRes.body.results.find(r => r.skillName === 'HTML');
    const cssResult = submitRes.body.results.find(r => r.skillName === 'CSS');
    const jsResult = submitRes.body.results.find(r => r.skillName === 'JavaScript');
    
    assert(htmlResult && htmlResult.score === 4 && htmlResult.identifiedLevel === 'Advanced', 'HTML identified as Advanced (4/5)');
    assert(cssResult && cssResult.score === 2 && cssResult.identifiedLevel === 'Intermediate', 'CSS identified as Intermediate (2/5)');
    assert(jsResult && jsResult.score === 1 && jsResult.identifiedLevel === 'Beginner', 'JavaScript identified as Beginner (1/5)');

    // 6. Test POST /api/entrance-assessment/retake/:skillName
    console.log('\nTesting POST /api/entrance-assessment/retake/JavaScript:');
    const retakePayload = {
      answers: [0, 0, 0, 0, -1] // 4/5 -> Advanced!
    };
    const retakeRes = await request('POST', `/api/entrance-assessment/retake/${encodeURIComponent('JavaScript')}`, retakePayload, studentToken);
    assert(retakeRes.status === 200, 'Retake returned 200 OK');
    assert(retakeRes.body.result.score === 4 && retakeRes.body.result.identifiedLevel === 'Advanced', 'JavaScript upgraded to Advanced on retake (4/5)');
    assert(retakeRes.body.result.attemptNumber === 2, 'Retake attempt number is 2');

    // 7. Test GET /api/student/dashboard (Student Dashboard Integration - My Skill Levels)
    console.log('\nTesting GET /api/student/dashboard "My Skill Levels" Section:');
    const dashRes = await request('GET', '/api/student/dashboard', null, studentToken);
    assert(dashRes.status === 200, 'Student dashboard returned 200 OK');
    assert(dashRes.body.verifiedSkillsSection !== undefined, 'Dashboard includes verifiedSkillsSection');
    assert(dashRes.body.verifiedSkillsSection.mySkillLevels !== undefined, 'Dashboard includes mySkillLevels');
    
    const dashLevels = dashRes.body.verifiedSkillsSection.mySkillLevels;
    const dashHTML = dashLevels.find(s => s.name === 'HTML');
    const dashJS = dashLevels.find(s => s.name === 'JavaScript');
    assert(dashHTML && dashHTML.identifiedLevel === 'Advanced', 'Dashboard shows HTML as Advanced');
    assert(dashJS && dashJS.identifiedLevel === 'Advanced', 'Dashboard shows JavaScript updated to Advanced');

    // 8. Test Admin Oversight: Create Admin and check GET /api/admin/entrance-assessments
    console.log('\nTesting Admin Oversight GET /api/admin/entrance-assessments:');
    const adminEmail = `admin_api_levels_${Date.now()}@skillforge.test`;
    const adminUser = await User.create({
      name: 'Admin Faculty',
      email: adminEmail,
      password: 'adminPassword123',
      role: 'admin'
    });
    const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'skillforge_secret_key');

    const adminEntranceRes = await request('GET', '/api/admin/entrance-assessments', null, adminToken);
    assert(adminEntranceRes.status === 200, 'Admin entrance assessments returned 200 OK');
    assert(adminEntranceRes.body.stats !== undefined, 'Admin response contains stats object');
    assert(adminEntranceRes.body.stats.completedCount >= 1, 'Completed students counted in admin stats');
    
    const adminStudentReport = adminEntranceRes.body.students.find(s => s.id.toString() === studentId.toString());
    assert(adminStudentReport !== undefined, 'Student report listed in admin oversight');
    assert(adminStudentReport.assessmentStatus === 'Completed', 'Student status marked Completed');
    assert(adminStudentReport.verifiedSkills.some(v => v.identifiedLevel === 'Advanced'), 'Admin view shows student identified skill level');

    // Cleanup
    await User.deleteMany({ _id: { $in: [studentId, adminUser._id] } });
    await Skill.deleteMany({ user: studentId });
    await AssessmentResult.deleteMany({ user: studentId });

    console.log('\n================================================================');
    console.log(`  API INTEGRATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('================================================================');

    server.close();
    await mongoose.disconnect();
    process.exit(failedTests > 0 ? 1 : 0);

  } catch (err) {
    console.error('API Test Error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

runApiTests();
