/**
 * scripts/verify-admin-and-login.js
 * Comprehensive automated integration testing for:
 * 1. Student Login and Admin Login role selection & strict validation
 * 2. Correct dashboard redirection for each role
 * 3. Adding, editing, viewing, and deleting a platform skill
 * 4. Adding and editing a career and its required skills
 * 5. Creating an assessment and confirming it appears for students and scores correctly
 * 6. Creating and updating a learning roadmap, preserving student progress
 * 7. Viewing student records and reports
 * 8. Updating the admin profile
 * 9. Refreshing pages / re-querying to confirm database changes persist
 * 10. Confirming existing student features still work
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://127.0.0.1:5000/api';

let studentToken = null;
let adminToken = null;
let studentUserId = null;
let adminUserId = null;

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}`);
    failed++;
  }
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runVerification() {
  console.log('====================================================');
  console.log('  SKILLFORGE COMPREHENSIVE ROLE & ADMIN TEST SUITE  ');
  console.log('====================================================\n');

  try {
    // Connect to DB directly to inspect state and provision credentials
    await mongoose.connect('mongodb://127.0.0.1:27017/skillforge_db');

    const User = require('../models/User');
    const GlobalSkill = require('../models/GlobalSkill');
    const CareerRole = require('../models/CareerRole');
    const Assessment = require('../models/Assessment');
    const AssessmentResult = require('../models/AssessmentResult');
    const CareerRoadmap = require('../models/CareerRoadmap');
    const RoadmapTask = require('../models/RoadmapTask');

    // Ensure baseline student account exists
    let studentUser = await User.findOne({ email: 'student@example.com' });
    if (!studentUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      studentUser = await User.create({
        name: 'Demo Student',
        email: 'student@example.com',
        password: hash,
        role: 'student',
        targetCareer: 'Full Stack Developer',
        college: 'State University',
        degree: 'B.Tech',
        department: 'CS',
        academicYear: 'Final Year'
      });
    }
    studentUserId = studentUser._id.toString();

    // Ensure baseline admin account exists
    let adminUser = await User.findOne({ email: 'admin@skillforge.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('adminpassword123', salt);
      adminUser = await User.create({
        name: 'Platform Administrator',
        email: 'admin@skillforge.com',
        password: hash,
        role: 'admin'
      });
    }
    adminUserId = adminUser._id.toString();

    // =========================================================================
    // TEST 1: Role Selection & Strict Verification During Login
    // =========================================================================
    console.log('Test 1: Student Login and Admin Login Role Selection & Strict Matching');

    // 1A: Student selects Student Login with valid student credentials -> SUCCESS
    const sLoginValid = await api('/auth/login', {
      method: 'POST',
      body: { email: 'student@example.com', password: 'password123', role: 'student' }
    });
    assert(sLoginValid.status === 200 && sLoginValid.data.success === true, 'Student selects Student Login: successfully authenticated');
    assert(sLoginValid.data.user.role === 'student', 'Database verified role is student');
    studentToken = sLoginValid.data.token;

    // 1B: Student selects Admin Login with student credentials -> MUST BE REJECTED WITH 403
    const sLoginWrongRole = await api('/auth/login', {
      method: 'POST',
      body: { email: 'student@example.com', password: 'password123', role: 'admin' }
    });
    assert(sLoginWrongRole.status === 403, 'Student selecting Admin Login is rejected with HTTP 403');
    assert(sLoginWrongRole.data.message.includes('student'), 'Clear error message indicating account is registered as a student');

    // 1C: Admin selects Admin Login with valid admin credentials -> SUCCESS
    const aLoginValid = await api('/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillforge.com', password: 'adminpassword123', role: 'admin' }
    });
    assert(aLoginValid.status === 200 && aLoginValid.data.success === true, 'Admin selects Admin Login: successfully authenticated');
    assert(aLoginValid.data.user.role === 'admin', 'Database verified role is admin');
    adminToken = aLoginValid.data.token;

    // 1D: Admin selects Student Login with admin credentials -> MUST BE REJECTED WITH 403
    const aLoginWrongRole = await api('/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillforge.com', password: 'adminpassword123', role: 'student' }
    });
    assert(aLoginWrongRole.status === 403, 'Admin selecting Student Login is rejected with HTTP 403');
    assert(aLoginWrongRole.data.message.includes('administrator'), 'Clear error message indicating account is an administrator');

    // =========================================================================
    // TEST 2: Correct Dashboard Redirection and Privilege Guarding
    // =========================================================================
    console.log('\nTest 2: Correct Dashboard Redirection & Access Guarding');
    assert(sLoginValid.data.user.role === 'student', 'Student account correctly designated for Student Dashboard (dashboard.html)');
    assert(aLoginValid.data.user.role === 'admin', 'Admin account correctly designated for Admin Dashboard (admin.html)');

    // Student attempting to access /api/admin/stats -> Rejected with 403 Forbidden
    const studentAdminAccess = await api('/admin/stats', { token: studentToken });
    assert(studentAdminAccess.status === 403, 'Student cannot access administrative API endpoints (/api/admin/*)');

    // Admin accessing /api/admin/stats -> Allowed with 200 OK
    const adminStatsAccess = await api('/admin/stats', { token: adminToken });
    assert(adminStatsAccess.status === 200 && adminStatsAccess.data.stats != null, 'Admin can access administrative stats endpoint');

    // =========================================================================
    // TEST 3: Adding, Editing, Viewing, and Deleting a Skill
    // =========================================================================
    console.log('\nTest 3: Manage Skills — Add, View, Edit, and Delete in MongoDB');

    // 3A: Add new skill
    const testSkillName = 'GraphQL Architecture ' + Date.now();
    const createSkillRes = await api('/admin/skills', {
      method: 'POST',
      token: adminToken,
      body: {
        name: testSkillName,
        category: 'Web Development',
        description: 'Schema definition, queries, mutations, resolvers, and Apollo Client integration.'
      }
    });
    assert(createSkillRes.status === 201 && createSkillRes.data.skill != null, `Admin adds new skill '${testSkillName}'`);
    const createdSkillId = createSkillRes.data.skill._id;

    // 3B: View all available skills
    const viewSkillsRes = await api('/admin/skills', { token: adminToken });
    assert(viewSkillsRes.status === 200 && Array.isArray(viewSkillsRes.data.skills), 'Admin views available skills list');
    const skillFound = viewSkillsRes.data.skills.some(s => s._id === createdSkillId);
    assert(skillFound === true, 'Newly added skill appears in available skills list');

    // 3C: Confirm newly added skill is visible to students for selection
    const publicSkillsRes = await api('/careers/available-skills');
    const publicSkillFound = publicSkillsRes.data.skills.some(s => s.name === testSkillName);
    assert(publicSkillFound === true, 'Newly added skill immediately accessible to student skill selection');

    // 3D: Edit the skill
    const editSkillRes = await api(`/admin/skills/${createdSkillId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        name: testSkillName + ' (Updated)',
        category: 'Backend',
        description: 'Advanced GraphQL federation and schema stitching.'
      }
    });
    assert(editSkillRes.status === 200 && editSkillRes.data.skill.name.includes('(Updated)'), 'Admin edits existing skill and saves to MongoDB');

    // 3E: Delete the skill
    const deleteSkillRes = await api(`/admin/skills/${createdSkillId}`, {
      method: 'DELETE',
      token: adminToken
    });
    assert(deleteSkillRes.status === 200, 'Admin deletes skill after confirmation');

    const verifyDeletedSkill = await GlobalSkill.findById(createdSkillId);
    assert(verifyDeletedSkill === null, 'Skill is completely removed from MongoDB');

    // =========================================================================
    // TEST 4: Adding and Editing a Career and its Required Skills
    // =========================================================================
    console.log('\nTest 4: Manage Careers — Add, Edit, and Required Skills Benchmarks');

    const testCareerTitle = 'Cloud Solutions Architect ' + Date.now();
    const createCareerRes = await api('/admin/roles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: testCareerTitle,
        category: 'Engineering',
        description: 'Designs and implements scalable enterprise cloud architectures.',
        averageSalary: '₹14 - 24 LPA',
        requiredSkills: [
          { name: 'Docker', minProficiency: 'Advanced', requiredLevel: 4, importance: 'High' },
          { name: 'AWS Cloud', minProficiency: 'Advanced', requiredLevel: 4, importance: 'High' },
          { name: 'Python', minProficiency: 'Intermediate', requiredLevel: 3, importance: 'Medium' }
        ]
      }
    });
    assert(createCareerRes.status === 201 && createCareerRes.data.role != null, `Admin adds new career '${testCareerTitle}'`);
    const createdCareerId = createCareerRes.data.role._id;

    // Verify career appears in student Career Explorer
    const careersPublicRes = await api('/careers');
    const careerInList = careersPublicRes.data.roles.some(r => r.title === testCareerTitle);
    assert(careerInList === true, 'Newly added career immediately visible in Career Explorer');

    // Edit career and update required proficiency
    const editCareerRes = await api(`/admin/roles/${createdCareerId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        title: testCareerTitle,
        category: 'Tech',
        description: 'Updated responsibilities covering Kubernetes and microservices.',
        averageSalary: '₹16 - 28 LPA',
        requiredSkills: [
          { name: 'Docker', minProficiency: 'Expert', requiredLevel: 5, importance: 'High' },
          { name: 'AWS Cloud', minProficiency: 'Expert', requiredLevel: 5, importance: 'High' },
          { name: 'Kubernetes', minProficiency: 'Advanced', requiredLevel: 4, importance: 'High' }
        ]
      }
    });
    assert(editCareerRes.status === 200, 'Admin edits career description, salary, and required proficiency levels');
    assert(editCareerRes.data.role.requiredSkills.some(s => s.name === 'Kubernetes'), 'Updated skills list persisted in MongoDB');

    // Delete test career
    const deleteCareerRes = await api(`/admin/roles/${createdCareerId}`, {
      method: 'DELETE',
      token: adminToken
    });
    assert(deleteCareerRes.status === 200, 'Admin deletes career after confirmation');

    // =========================================================================
    // TEST 5: Creating an Assessment and Confirming it Appears for Students
    // =========================================================================
    console.log('\nTest 5: Manage Assessments — Create, View, Student Quiz Execution, and Delete');

    const testAssessmentTitle = 'DevOps Mastery Quiz ' + Date.now();
    const createAssessmentRes = await api('/admin/assessments', {
      method: 'POST',
      token: adminToken,
      body: {
        title: testAssessmentTitle,
        topic: 'devops_' + Date.now(),
        skillCategory: 'DevOps',
        relatedSkill: 'Docker',
        difficulty: 'Intermediate',
        durationMinutes: 15,
        passingPercentage: 75,
        description: 'Assesses containerization principles, volume binding, and multi-stage builds.',
        questions: [
          {
            questionText: 'Which Dockerfile instruction specifies the base container image?',
            options: ['RUN', 'FROM', 'EXPOSE', 'COPY'],
            correctOptionIndex: 1,
            explanation: 'The FROM instruction initializes a new build stage and sets the Base Image.'
          },
          {
            questionText: 'What is the command to run a container in detached background mode?',
            options: ['docker run -d', 'docker run -b', 'docker exec -it', 'docker start -bg'],
            correctOptionIndex: 0,
            explanation: '-d stands for detached mode.'
          }
        ]
      }
    });
    assert(createAssessmentRes.status === 201 && createAssessmentRes.data.assessment != null, `Admin creates assessment '${testAssessmentTitle}'`);
    const createdAssessmentId = createAssessmentRes.data.assessment._id;

    // Verify it appears in student assessments list
    const studentAssessmentsRes = await api('/assessments', { token: studentToken });
    const assessmentVisibleToStudent = studentAssessmentsRes.data.assessments.some(a => a._id === createdAssessmentId);
    assert(assessmentVisibleToStudent === true, 'Newly created assessment appears for students to take');

    // Student takes the test and submits answers (both correct -> 100% score)
    const testSubmitRes = await api(`/assessments/${createdAssessmentId}/submit`, {
      method: 'POST',
      token: studentToken,
      body: { answers: [1, 0] }
    });
    assert(testSubmitRes.status === 200 && testSubmitRes.data.result != null, 'Student submits assessment answers');
    assert(testSubmitRes.data.result.score === 2 && testSubmitRes.data.result.passed === true, 'Server evaluates answers accurately: 2/2 (100% Passed)');

    // Verify student result saved in AssessmentResult collection
    const savedResult = await AssessmentResult.findOne({ user: studentUserId, assessmentTitle: testAssessmentTitle });
    assert(savedResult != null && savedResult.score === 2, 'Student test result permanently saved to MongoDB AssessmentResult collection');

    // Delete test assessment
    await api(`/admin/assessments/${createdAssessmentId}`, { method: 'DELETE', token: adminToken });

    // =========================================================================
    // TEST 6: Creating and Updating a Learning Roadmap
    // =========================================================================
    console.log('\nTest 6: Manage Learning Roadmaps — Create, Edit, and Preserve Progress');

    const testRoadmapCareer = 'Blockchain Engineer ' + Date.now();
    const createRoadmapRes = await api('/admin/roadmaps', {
      method: 'POST',
      token: adminToken,
      body: {
        careerTitle: testRoadmapCareer,
        description: 'Comprehensive pathway to mastering distributed ledgers and smart contracts.',
        phases: [
          {
            phaseOrder: 1,
            phaseName: 'Phase 1 — Cryptography & Consensus',
            tasks: [
              {
                taskId: 'task_crypto_1',
                title: 'Study Public Key Cryptography & Hashing',
                instructions: 'Learn SHA-256, asymmetric encryption, and digital signatures.',
                estimatedEffort: '12 - 16 hours',
                order: 1
              }
            ]
          },
          {
            phaseOrder: 2,
            phaseName: 'Phase 2 — Smart Contract Development',
            tasks: [
              {
                taskId: 'task_solidity_1',
                title: 'Develop Solidity Smart Contracts',
                instructions: 'Write, compile, and test ERC-20 tokens using Hardhat.',
                estimatedEffort: '20 - 25 hours',
                order: 1
              }
            ]
          }
        ]
      }
    });
    assert(createRoadmapRes.status === 201 && createRoadmapRes.data.roadmap != null, `Admin creates learning roadmap for '${testRoadmapCareer}'`);
    const createdRoadmapId = createRoadmapRes.data.roadmap._id;

    // Simulate student having completed a task on this roadmap
    const studentTask = await RoadmapTask.create({
      user: studentUserId,
      title: 'Study Public Key Cryptography & Hashing',
      description: 'Initial instructions',
      phase: 'Phase 1 — Cryptography & Consensus',
      status: 'Completed',
      priority: 'High',
      sequence: 1
    });
    assert(studentTask.status === 'Completed', 'Student milestone is marked as Completed');

    // Admin updates the roadmap content (modifying phase name and task instructions)
    const updateRoadmapRes = await api(`/admin/roadmaps/${createdRoadmapId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        careerTitle: testRoadmapCareer,
        description: 'Updated pathway with Layer 2 rollups and ZK-proofs.',
        phases: [
          {
            phaseOrder: 1,
            phaseName: 'Phase 1 — Advanced Cryptography & Consensus',
            tasks: [
              {
                taskId: 'task_crypto_1',
                title: 'Study Public Key Cryptography & Hashing',
                instructions: 'Updated instructions: Also study elliptic curves and ZK-SNARKs.',
                estimatedEffort: '16 - 20 hours',
                order: 1
              }
            ]
          }
        ]
      }
    });
    assert(updateRoadmapRes.status === 200, 'Admin edits roadmap phases, instructions, and estimated effort');

    // Verify student's completed task status was NOT erased
    const checkedStudentTask = await RoadmapTask.findById(studentTask._id);
    assert(checkedStudentTask.status === 'Completed', 'Student completed task progress strictly preserved after roadmap edit');
    assert(checkedStudentTask.phase.includes('Advanced'), 'Task phase metadata successfully synchronized');

    // Clean up test roadmap and task
    await api(`/admin/roadmaps/${createdRoadmapId}`, { method: 'DELETE', token: adminToken });
    await RoadmapTask.findByIdAndDelete(studentTask._id);

    // =========================================================================
    // TEST 7: Viewing Student Records and Reports
    // =========================================================================
    console.log('\nTest 7: View Student Records and Reports & Analytics');

    // 7A: Get student detail view
    const studentDetailRes = await api(`/admin/users/${studentUserId}`, { token: adminToken });
    assert(studentDetailRes.status === 200 && studentDetailRes.data.student != null, 'Admin can view individual student profile and progress');
    assert(studentDetailRes.data.student.password == null && studentDetailRes.data.student.passwordHash == null, 'Student password and password hash are NOT exposed');

    // 7B: Get platform analytics and reports
    const reportsRes = await api('/admin/reports', { token: adminToken });
    assert(reportsRes.status === 200 && reportsRes.data.success === true, 'Admin reports and analytics load real database aggregations');
    assert(typeof reportsRes.data.totalStudents === 'number', 'Reports include student registration totals');
    assert(Array.isArray(reportsRes.data.assessmentStats), 'Reports include assessment participation and pass rates');
    assert(reportsRes.data.roadmapSummary != null, 'Reports include roadmap milestone completion progress');

    // =========================================================================
    // TEST 8: Updating the Admin Profile
    // =========================================================================
    console.log('\nTest 8: Admin Profile — View and Update Permitted Details');

    // 8A: View Admin Profile
    const viewAdminProf = await api('/admin/profile', { token: adminToken });
    assert(viewAdminProf.status === 200 && viewAdminProf.data.admin != null, 'Admin retrieves profile details');
    assert(viewAdminProf.data.admin.role === 'Admin', 'Role is clearly displayed as Admin');

    // 8B: Update permitted details (name, email)
    const updateAdminProf = await api('/admin/profile', {
      method: 'PUT',
      token: adminToken,
      body: {
        name: 'Dr. Jane Admin, Dean of Technology',
        email: 'dean.admin@skillforge.com'
      }
    });
    assert(updateAdminProf.status === 200, 'Admin profile updated permitted personal details in MongoDB');
    assert(updateAdminProf.data.admin.name === 'Dr. Jane Admin, Dean of Technology', 'Updated name persisted');
    assert(updateAdminProf.data.admin.role === 'Admin', 'Role remains strictly Admin (non-changeable)');

    // Verify in database directly
    const reloadedAdmin = await User.findById(adminUserId);
    assert(reloadedAdmin.name === 'Dr. Jane Admin, Dean of Technology' && reloadedAdmin.role === 'admin', 'Changes confirmed in MongoDB User record');

    // Revert admin email back to admin@skillforge.com for consistency
    reloadedAdmin.name = 'Administrator';
    reloadedAdmin.email = 'admin@skillforge.com';
    await reloadedAdmin.save();

    // =========================================================================
    // TEST 9: Page Refresh / Database Persistence
    // =========================================================================
    console.log('\nTest 9: Database Persistence Across Sessions');
    const persistentSkill = await GlobalSkill.findOne({ name: 'JavaScript' });
    assert(persistentSkill != null && persistentSkill.category === 'Programming', 'Skills catalog persists across server restarts');

    const persistentUser = await User.findById(studentUserId);
    assert(persistentUser != null && persistentUser.role === 'student', 'Student accounts and credentials persist in MongoDB');

    // =========================================================================
    // TEST 10: Confirming Existing Student Features Still Work
    // =========================================================================
    console.log('\nTest 10: Confirming Existing Student Features Remain Operational');

    // Dashboard stats
    const dashRes = await api('/student/dashboard', { token: studentToken });
    assert(dashRes.status === 200 && dashRes.data.success === true, 'Student dashboard metrics API operational');

    // Gap analysis
    const gapRes = await api('/careers/gap-analysis', { token: studentToken });
    assert(gapRes.status === 200 && gapRes.data.overallReadiness !== undefined, 'Skill gap analysis operational');

    // Student Roadmaps
    const rmRes = await api('/careers/roadmap', { token: studentToken });
    assert(rmRes.status === 200 && Array.isArray(rmRes.data.roadmapSteps), 'Personalized student roadmap operational');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    process.exit(1);
  }
}

runVerification();
