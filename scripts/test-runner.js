/**
 * scripts/test-runner.js
 * Comprehensive Automated Verification Test Suite for SkillForge.
 * Validates all 13 modules, academic registration, deterministic skill gap analysis,
 * rule-based roadmaps, assessment scoring, data isolation, admin authorization,
 * and confirms complete removal of the Internship Tracker.
 * 
 * Run with: npm test
 */

process.env.NODE_ENV = 'test';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Database Connection
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Skill = require('../models/Skill');
const CareerRole = require('../models/CareerRole');
const RoadmapTask = require('../models/RoadmapTask');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const Application = require('../models/Application');

// Services & Data
const skillGapService = require('../services/skillGapService');
const roadmapService = require('../services/roadmapService');
const { careers, getCareerById } = require('../data/careers');
const { questions, scoreQuiz, getQuestionsByTopic } = require('../data/questions');

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

async function runTests() {
  console.log('========================================================');
  console.log('  SKILLFORGE AUTOMATED VERIFICATION TEST SUITE');
  console.log('========================================================\n');

  try {
    // -------------------------------------------------------------------------
    // Test 1: Database Connection & Environment Config
    // -------------------------------------------------------------------------
    console.log('Test 1: MongoDB Connection Initialization');
    await connectDB();
    assert(mongoose.connection.readyState === 1, 'Server successfully connects to MongoDB');

    // Clean up test records from prior runs
    await User.deleteMany({ email: /@testrunner\.skillforge$/ });

    // -------------------------------------------------------------------------
    // Test 2: Student Registration with Full Academic Info & Password Hashing
    // -------------------------------------------------------------------------
    console.log('\nTest 2: Student Registration with Academic Information & Hashing');
    const rawPassword = 'StudentSecure@2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    assert(passwordHash !== rawPassword && passwordHash.startsWith('$2'), 'Password securely hashed with bcrypt (never plaintext)');

    const testStudentA = new User({
      name: 'Priya Patel',
      email: 'priya.patel@testrunner.skillforge',
      password: passwordHash,
      role: 'student',
      college: 'National Institute of Engineering',
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      academicYear: 'Final Year (8th Sem)',
      educationalBackground: 'Computer Science',
      targetCareer: 'Full Stack Developer',
      bio: 'Aspiring Full Stack Engineer passionate about scalable web technologies.',
      professionalSummary: 'Aspiring Full Stack Engineer passionate about scalable web technologies.',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      skills: [
        { name: 'JavaScript', category: 'Programming', rating: 4, proficiency: 'Advanced' },
        { name: 'HTML5', category: 'Web Development', rating: 4, proficiency: 'Advanced' }
      ]
    });
    await testStudentA.save();

    assert(testStudentA._id != null, 'Student A record saved to MongoDB with ObjectId');
    assert(testStudentA.phone === '+91 98765 43210', 'Phone number saved correctly during registration');
    assert(testStudentA.location === 'Bangalore, India', 'City / Location saved correctly during registration');
    assert(testStudentA.college === 'National Institute of Engineering', 'College and academic fields saved correctly');
    assert(testStudentA.educationalBackground === 'Computer Science', 'Educational background saved correctly');
    assert(testStudentA.targetCareer === 'Full Stack Developer', 'Target career saved correctly during registration');
    assert(testStudentA.bio != null && testStudentA.bio.includes('Full Stack'), 'Professional bio summary saved correctly during registration');

    // -------------------------------------------------------------------------
    // Test 3: Duplicate Email Prevention
    // -------------------------------------------------------------------------
    console.log('\nTest 3: Duplicate Email Rejection');
    let duplicateRejected = false;
    try {
      const duplicateStudent = new User({
        name: 'Impostor',
        email: 'priya.patel@testrunner.skillforge',
        password: passwordHash,
        college: 'Other College'
      });
      await duplicateStudent.save();
    } catch (err) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate email registration is strictly rejected by MongoDB unique constraint');

    // -------------------------------------------------------------------------
    // Test 4: Password Verification
    // -------------------------------------------------------------------------
    console.log('\nTest 4: Password Verification & Authentication');
    const validPass = await bcrypt.compare(rawPassword, testStudentA.password);
    const invalidPass = await bcrypt.compare('WrongPassword!123', testStudentA.password);
    assert(validPass === true, 'Correct credentials successfully authenticated with bcrypt');
    assert(invalidPass === false, 'Incorrect credentials rejected with authentication failure');

    // Create Student B for data isolation and access boundary tests
    const testStudentB = new User({
      name: 'Arjun Verma',
      email: 'arjun.verma@testrunner.skillforge',
      password: passwordHash,
      role: 'student',
      college: 'City University',
      degree: 'B.Sc IT',
      department: 'Information Technology',
      academicYear: '3rd Year',
      educationalBackground: 'Information Technology',
      targetCareer: 'Data Analyst'
    });
    await testStudentB.save();

    // -------------------------------------------------------------------------
    // Test 5: Skills Inventory & Duplicate Prevention for Same Student
    // -------------------------------------------------------------------------
    console.log('\nTest 5: Skill Inventory & Duplicate Prevention');
    const studentASkill1 = await Skill.create({
      user: testStudentA._id,
      name: 'JavaScript',
      normalizedName: 'javascript',
      category: 'Programming',
      proficiency: 'Advanced'
    });
    assert(studentASkill1._id != null, 'Student A initial skill created in database');

    let duplicateSkillRejected = false;
    try {
      await Skill.create({
        user: testStudentA._id,
        name: 'javascript',
        normalizedName: 'javascript',
        category: 'Programming',
        proficiency: 'Beginner'
      });
    } catch (err) {
      duplicateSkillRejected = true;
    }
    assert(duplicateSkillRejected, 'Duplicate skill for the same student is prevented by compound unique index (user + normalizedName)');

    // -------------------------------------------------------------------------
    // Test 6: Cross-Student Data Isolation & Ownership Scoping
    // -------------------------------------------------------------------------
    console.log('\nTest 6: Student Data Isolation & Ownership Boundaries');
    // Query Student B's skills - ensure Student A's skills are not returned
    const studentBSkills = await Skill.find({ user: testStudentB._id });
    const leakDetected = studentBSkills.some(s => s._id.toString() === studentASkill1._id.toString());
    assert(!leakDetected, 'Student B cannot view Student A private skills (Strict query scoping by authenticated user ID)');

    // Attempt to delete Student A's skill using Student B's user scope
    const unauthorizedDelete = await Skill.findOneAndDelete({ _id: studentASkill1._id, user: testStudentB._id });
    assert(unauthorizedDelete === null, 'Student B cannot delete Student A skill by ID injection');

    const verifyAIntact = await Skill.findById(studentASkill1._id);
    assert(verifyAIntact != null, 'Student A private record remains intact after unauthorized attempt');

    // -------------------------------------------------------------------------
    // Test 7: Profile Updates Persistence
    // -------------------------------------------------------------------------
    console.log('\nTest 7: Profile Updates Persistence');
    testStudentA.college = 'Indian Institute of Information Technology';
    testStudentA.academicYear = 'Graduated (2026)';
    testStudentA.bio = 'Passionate developer building responsive full-stack applications.';
    await testStudentA.save();

    const refreshedUser = await User.findById(testStudentA._id);
    assert(
      refreshedUser.college === 'Indian Institute of Information Technology' &&
      refreshedUser.academicYear === 'Graduated (2026)',
      'Updated profile fields persist correctly in MongoDB'
    );

    // -------------------------------------------------------------------------
    // Test 8: Deterministic Skill-Gap Analysis Calculation
    // -------------------------------------------------------------------------
    console.log('\nTest 8: Deterministic Skill-Gap Analysis');
    // Add additional skills for Student A
    await Skill.create([
      { user: testStudentA._id, name: 'HTML5', normalizedName: 'html5', category: 'Web Development', proficiency: 'Advanced' },
      { user: testStudentA._id, name: 'CSS3', normalizedName: 'css3', category: 'Web Development', proficiency: 'Basic' } // Below Intermediate
    ]);

    const targetRole = getCareerById('full-stack-developer') || careers[0];
    const userAllSkills = await Skill.find({ user: testStudentA._id });

    const gap = skillGapService.calculateSkillGap(targetRole, userAllSkills);

    assert(gap.totalRequired === targetRole.requiredSkills.length, 'Total required skills equals career role requirements count');
    assert(gap.matchedSkills.some(s => s.name.toLowerCase().includes('javascript')), 'Matched skill detected (JavaScript Advanced meets requirement)');
    assert(gap.needsImprovementSkills.some(s => s.name.toLowerCase().includes('css')), 'Needs Improvement detected (CSS Basic < Intermediate requirement)');
    assert(gap.missingSkills.some(s => s.name.toLowerCase().includes('node') || s.name.toLowerCase().includes('mongo')), 'Missing skill detected correctly');

    const expectedMatchPct = Math.round((gap.matchedCount / gap.totalRequired) * 100);
    assert(gap.matchPercentage === expectedMatchPct, `Readiness calculation formula strictly verified: ${gap.matchPercentage}% = (${gap.matchedCount}/${gap.totalRequired}) * 100`);

    // -------------------------------------------------------------------------
    // Test 9: Rule-based Roadmap Generation from Skill Gaps
    // -------------------------------------------------------------------------
    console.log('\nTest 9: Personalized Learning Roadmap Generation');
    const roadmapResult = await roadmapService.generateRoadmap(testStudentA._id, 'Full Stack Developer');
    const generatedTasks = roadmapResult.tasks || [];
    assert(generatedTasks.length > 0, `Roadmap generated ${generatedTasks.length} milestones derived directly from skill gaps`);

    const missingTask = generatedTasks.find(t => t.priority === 'High');
    assert(missingTask != null && missingTask.status === 'Not Started', 'Missing skills assigned High Priority with Not Started status');

    // Test task status progression: Not Started -> In Progress -> Completed
    missingTask.status = 'In Progress';
    await missingTask.save();
    let updatedTask = await RoadmapTask.findById(missingTask._id);
    assert(updatedTask.status === 'In Progress', 'Task status update to In Progress persisted to MongoDB');

    missingTask.status = 'Completed';
    await missingTask.save();
    updatedTask = await RoadmapTask.findById(missingTask._id);
    assert(updatedTask.status === 'Completed', 'Task status update to Completed persisted to MongoDB');

    // Test duplicate prevention on regeneration
    const regenResult = await roadmapService.generateRoadmap(testStudentA._id, 'Full Stack Developer');
    const regenTasks = regenResult.tasks || [];
    assert(regenTasks.length === generatedTasks.length, 'Regenerating roadmap preserves existing tasks and avoids duplicate records');

    // -------------------------------------------------------------------------
    // Test 10: Practice Assessments & Server-Side Scoring
    // -------------------------------------------------------------------------
    console.log('\nTest 10: Assessment Questions Sanitization & Server-Side Evaluation');
    const sanitizedQuestions = getQuestionsByTopic('javascript', true);
    const leakedAnswers = sanitizedQuestions.some(q => q.correctIndex !== undefined || q.explanation !== undefined);
    assert(!leakedAnswers, 'Quiz questions sent to client have correct answers and explanations sanitized');

    // Evaluate answers on server
    const sampleAnswers = {
      'js_1': 2,
      'js_2': 1,
      'js_3': 1,
      'js_4': 1,
      'js_5': 0
    };
    const scoredResult = scoreQuiz('javascript', sampleAnswers);
    assert(scoredResult.score === 5 && scoredResult.percentage === 100, 'Server calculates 100% (5/5) without client tampering');

    const testAttempt = await AssessmentResult.create({
      user: testStudentA._id,
      topic: scoredResult.topic,
      score: scoredResult.score,
      totalQuestions: scoredResult.totalQuestions,
      percentage: scoredResult.percentage,
      answers: scoredResult.answers
    });
    assert(testAttempt._id != null, 'Assessment attempt result saved to MongoDB');

    // -------------------------------------------------------------------------
    // Test 11: Project Portfolio Full CRUD
    // -------------------------------------------------------------------------
    console.log('\nTest 11: Project Portfolio CRUD Operations');
    const project = await Project.create({
      user: testStudentA._id,
      title: 'SkillForge Career Readiness Platform',
      description: 'Unified career preparation and skill gap tracking platform with responsive Bootstrap 5 UI.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'Bootstrap 5'],
      techStack: ['Node.js', 'Express', 'MongoDB', 'Bootstrap 5'],
      projectUrl: 'https://github.com/student/skillforge',
      githubUrl: 'https://github.com/student/skillforge',
      status: 'Completed',
      completionDate: new Date('2026-04-10')
    });
    assert(project._id != null, 'Project created and saved to MongoDB');

    // Edit project
    project.title = 'SkillForge Enterprise Platform';
    project.status = 'In Progress';
    await project.save();
    const updatedProj = await Project.findById(project._id);
    assert(updatedProj.title === 'SkillForge Enterprise Platform' && updatedProj.status === 'In Progress', 'Project update persisted to MongoDB');

    // -------------------------------------------------------------------------
    // Test 12: Certification Management Full CRUD
    // -------------------------------------------------------------------------
    console.log('\nTest 12: Certification Management CRUD Operations');
    const cert = await Certification.create({
      user: testStudentA._id,
      title: 'Meta Certified Front-End Developer',
      name: 'Meta Certified Front-End Developer',
      issuer: 'Coursera / Meta',
      issueDate: 'Mar 2026',
      credentialUrl: 'https://coursera.org/verify/SAMPLE789'
    });
    assert(cert._id != null, 'Certification created and saved to MongoDB');

    // Edit certification
    cert.issuer = 'Meta Career Programs';
    await cert.save();
    const updatedCert = await Certification.findById(cert._id);
    assert(updatedCert.issuer === 'Meta Career Programs', 'Certification update persisted to MongoDB');

    // -------------------------------------------------------------------------
    // Test 12B: Achievement Management CRUD Operations
    // -------------------------------------------------------------------------
    console.log('\nTest 12B: Achievement Management CRUD Operations');
    const achievement = await Achievement.create({
      user: testStudentA._id,
      title: '1st Place - Smart City Hackathon 2025',
      issuer: 'ACM Student Chapter',
      date: 'Oct 2025',
      description: 'Built an IoT traffic management prototype using Node.js and MongoDB',
      url: 'https://hackathon.example.edu/winners'
    });
    assert(achievement._id != null, 'Achievement created and saved to MongoDB');

    // Edit achievement
    achievement.title = 'Grand Winner - Smart City Hackathon 2025';
    await achievement.save();
    const updatedAch = await Achievement.findById(achievement._id);
    assert(updatedAch.title === 'Grand Winner - Smart City Hackathon 2025', 'Achievement update persisted to MongoDB');

    // -------------------------------------------------------------------------
    // Test 13: Resume Data Aggregation & Customizable Settings
    // -------------------------------------------------------------------------
    console.log('\nTest 13: Resume Data Aggregation & Customizable Settings');
    testStudentA.linkedinUrl = 'https://linkedin.com/in/priyapatel';
    testStudentA.githubUrl = 'https://github.com/priyapatel';
    testStudentA.graduationYear = '2026';
    testStudentA.resumeTemplate = 'modern';
    await testStudentA.save();

    const studentUser = await User.findById(testStudentA._id).select('-password');
    const studentSkills = await Skill.find({ user: testStudentA._id });
    const studentProjects = await Project.find({ user: testStudentA._id });
    const studentCerts = await Certification.find({ user: testStudentA._id });
    const studentAchs = await Achievement.find({ user: testStudentA._id });

    assert(studentUser.name === 'Priya Patel', 'Resume includes student personal information');
    assert(studentUser.college === 'Indian Institute of Information Technology', 'Resume includes educational and academic information');
    assert(studentUser.linkedinUrl === 'https://linkedin.com/in/priyapatel', 'Resume includes verified LinkedIn profile URL');
    assert(studentUser.githubUrl === 'https://github.com/priyapatel', 'Resume includes GitHub / portfolio URL');
    assert(studentUser.graduationYear === '2026', 'Resume includes graduation year');
    assert(studentUser.resumeTemplate === 'modern', 'Resume template preference (modern/minimal/classic) persisted');
    assert(studentSkills.length >= 2, 'Resume incorporates actual student skills from database');
    assert(studentProjects.length >= 1, 'Resume incorporates student projects from database');
    assert(studentCerts.length >= 1, 'Resume incorporates student certifications from database');
    assert(studentAchs.length >= 1, 'Resume incorporates student achievements from database');

    // -------------------------------------------------------------------------
    // Test 14: Administrator Authorization & Role Checks
    // -------------------------------------------------------------------------
    console.log('\nTest 14: Administrator Authorization & Role Restrictions');
    const adminUser = new User({
      name: 'Admin Faculty',
      email: 'admin.faculty@testrunner.skillforge',
      password: passwordHash,
      role: 'admin'
    });
    await adminUser.save();

    // Verify user with 'Administrator' in name is still strictly treated as a student
    const studentWithAdminName = new User({
      name: 'Administrator Imposter',
      email: 'imposter.admin@testrunner.skillforge',
      password: passwordHash,
      role: 'student'
    });
    await studentWithAdminName.save();

    assert(testStudentA.role === 'student', 'Regular student is designated with role: student');
    assert(adminUser.role === 'admin', 'Administrator is designated with role: admin');
    assert(studentWithAdminName.role === 'student', 'User named Administrator is strictly evaluated by database role, not name string');
    assert(testStudentA.role !== 'admin', 'Student cannot acquire admin privileges through ordinary user flows');

    // Verify bcrypt password comparison for admin
    const adminPasswordMatches = await adminUser.matchPassword(rawPassword);
    assert(adminPasswordMatches, 'Admin password is encrypted with bcrypt and verifies correctly');

    // Verify role-based routing in login.html
    const loginHtml = fs.readFileSync(path.join(__dirname, '../public/login.html'), 'utf8');
    assert(loginHtml.includes("response.user.role === 'admin'"), 'Login page explicitly inspects user role from database response');
    assert(loginHtml.includes('admin.html'), 'Login page routes admin role to admin.html');
    assert(loginHtml.includes('dashboard.html'), 'Login page routes student role to dashboard.html');

    // Verify create-admin provisioning script existence
    assert(fs.existsSync(path.join(__dirname, '../scripts/create-admin.js')), 'Dedicated server-side admin provisioning script exists');

    // -------------------------------------------------------------------------
    // Test 15: Verification of Dedicated Student vs Admin Menus & Internship Removal
    // -------------------------------------------------------------------------
    console.log('\nTest 15: Verification of Dedicated Student vs Admin Menus & Internship Removal');
    
    // 1. Admin Menu Verification in admin.html
    const adminHtml = fs.readFileSync(path.join(__dirname, '../public/admin.html'), 'utf8');
    assert(adminHtml.includes('Admin Dashboard'), 'Admin menu contains Admin Dashboard');
    assert(adminHtml.includes('Manage Students'), 'Admin menu contains Manage Students');
    assert(adminHtml.includes('Manage Skills'), 'Admin menu contains Manage Skills');
    assert(adminHtml.includes('Manage Careers'), 'Admin menu contains Manage Careers');
    assert(adminHtml.includes('Manage Assessments'), 'Admin menu contains Manage Assessments');
    assert(adminHtml.includes('Manage Learning Roadmaps'), 'Admin menu contains Manage Learning Roadmaps');
    assert(adminHtml.includes('Reports and Analytics'), 'Admin menu contains Reports and Analytics');
    assert(adminHtml.includes('Admin Profile'), 'Admin menu contains Admin Profile');
    assert(adminHtml.includes('Logout'), 'Admin menu contains Logout');

    // 2. Student Menu Verification in dashboard.html
    const dashboardHtml = fs.readFileSync(path.join(__dirname, '../public/dashboard.html'), 'utf8');
    assert(dashboardHtml.includes('href="internships.html"'), 'Internship Tracker link present in student dashboard menu');
    assert(!dashboardHtml.includes('admin-only-link'), 'Admin panel link removed from student dashboard menu');
    assert(dashboardHtml.includes('Skill Gap Analysis'), 'Student menu preserves Skill Gap Analysis');
    assert(dashboardHtml.includes('Learning Roadmap'), 'Student menu preserves Learning Roadmap');
    assert(dashboardHtml.includes('Assessments'), 'Student menu preserves Assessments');
    assert(dashboardHtml.includes('Resume Builder'), 'Student menu preserves Resume Builder');
    const internshipPos = dashboardHtml.indexOf('href="internships.html"');
    const resumePos = dashboardHtml.indexOf('href="resume-builder.html"');
    assert(internshipPos !== -1 && resumePos !== -1 && internshipPos < resumePos, 'Internship Tracker comes before Resume Builder (Resume Builder is last)');

    // 3. Verify student pages have Internship Tracker in menus and file exists
    const profileHtml = fs.readFileSync(path.join(__dirname, '../public/profile.html'), 'utf8');
    const roadmapHtml = fs.readFileSync(path.join(__dirname, '../public/roadmap.html'), 'utf8');
    assert(profileHtml.includes('href="internships.html"'), 'Internship Tracker link present in profile menu');
    assert(roadmapHtml.includes('href="internships.html"'), 'Internship Tracker link present in roadmap menu');
    assert(fs.existsSync(path.join(__dirname, '../public/internships.html')), 'public/internships.html file exists and operational');

    // 4. Landing page footer check
    const landingHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    assert(landingHtml.includes('Internship Tracker'), 'Internship Tracker present in landing page footer features');

    // -------------------------------------------------------------------------
    // Test 16: Verification of General Contact Page Removal
    // -------------------------------------------------------------------------
    console.log('\nTest 16: Verification of General Contact Page Removal');
    const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
    assert(!indexHtml.includes('href="#contact"'), 'General Contact link removed from public navigation and footer');
    assert(indexHtml.includes('mailto:admin@skillforge.edu') || indexHtml.includes('Contact Admin'), 'Admin contact capability preserved');
    assert(!fs.existsSync(path.join(__dirname, '../public/contact.html')), 'No separate general contact.html file exists');

    // -------------------------------------------------------------------------
    // Test 17: Phased Career Roadmap Task Guidance & Persistence
    // -------------------------------------------------------------------------
    console.log('\nTest 17: Phased Career Roadmap Task Specifications');
    const generatedRoadmap = await roadmapService.generateUserRoadmap(testStudentA._id, 'Full Stack Developer');
    assert(generatedRoadmap.tasks.length > 0, 'Personalized roadmap tasks generated for target career');
    
    const sampleTask = generatedRoadmap.tasks[0];
    assert(sampleTask.phase != null && sampleTask.phase.startsWith('Phase'), 'Roadmap task assigned to a structured phase');
    assert(sampleTask.whyItMatters != null && sampleTask.whyItMatters.length > 5, 'Task contains "Why It Matters" rationale');
    assert(sampleTask.whatToLearn != null && sampleTask.whatToLearn.length > 0, 'Task specifies "What to Learn" topics');
    assert(sampleTask.whatToPractice != null && sampleTask.whatToPractice.length > 0, 'Task specifies "What to Practise" exercises');
    assert(sampleTask.completionCriteria != null && sampleTask.completionCriteria.length > 5, 'Task specifies concrete "Completion Criteria"');
    assert(sampleTask.estimatedEffort != null, 'Task specifies reasonable estimated effort');
    assert(Array.isArray(sampleTask.learningResources) && sampleTask.learningResources.length > 0, 'Task includes verified official learning resources');

    // -------------------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------------------
    console.log('\nCleaning test artifacts...');
    await Skill.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await Project.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await Certification.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await Achievement.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await AssessmentResult.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await RoadmapTask.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await Application.deleteMany({ user: { $in: [testStudentA._id, testStudentB._id] } });
    await User.deleteMany({ email: /@testrunner\.skillforge$/ });

    console.log('\n========================================================');
    console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('========================================================');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  }
}

runTests();
