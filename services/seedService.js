const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const AssessmentResult = require('../models/AssessmentResult');
const RoadmapTask = require('../models/RoadmapTask');

const DEMO_EMAIL = 'student.demo@skillforge.edu';
const DEMO_PASSWORD = 'DemoStudent@2026';

async function ensureDemoStudent() {
  try {
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
      // Demo user already exists
      return existing;
    }

    console.log('[Seed] Auto-seeding default demo student account...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    const demoUser = new User({
      name: 'Rohan Sharma',
      email: DEMO_EMAIL,
      passwordHash: passwordHash,
      college: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      department: 'Computer Science',
      academicYear: 'Final Year (8th Sem)',
      targetCareer: 'Full Stack Developer',
      professionalSummary: 'Enthusiastic full-stack web developer passionate about Node.js architectures, MongoDB schema design, and responsive user interfaces. Proven track record building functional web applications.'
    });

    await demoUser.save();

    // Seed Sample Skills
    const demoSkills = [
      { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced', notes: 'ES6+, Async/Await, closures' },
      { name: 'HTML5', category: 'Web Development', proficiency: 'Advanced', notes: 'Semantic markup, accessibility' },
      { name: 'CSS3', category: 'Web Development', proficiency: 'Intermediate', notes: 'Flexbox, responsive design' },
      { name: 'Node.js', category: 'Programming', proficiency: 'Intermediate', notes: 'Express APIs, RESTful services' },
      { name: 'Express.js', category: 'Web Development', proficiency: 'Intermediate', notes: 'Middleware, session auth' },
      { name: 'Bootstrap', category: 'Web Development', proficiency: 'Intermediate', notes: 'Grid layout, components' },
      { name: 'Git & GitHub', category: 'Tools and Platforms', proficiency: 'Intermediate', notes: 'Branching, PRs, version control' },
      { name: 'SQL', category: 'Database', proficiency: 'Basic', notes: 'SELECT queries, joins' }
    ];

    for (const s of demoSkills) {
      await Skill.create({
        user: demoUser._id,
        name: s.name,
        normalizedName: s.name.trim().toLowerCase(),
        category: s.category,
        proficiency: s.proficiency,
        notes: s.notes
      });
    }

    // Seed Sample Projects
    await Project.create({
      user: demoUser._id,
      title: 'SkillForge Platform',
      description: 'End-to-end career readiness and skill gap analysis system built with Express.js, MongoDB, and EJS.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'EJS', 'Bootstrap 5'],
      projectUrl: 'https://github.com/rohan-sharma/skillforge',
      status: 'Completed',
      completionDate: new Date('2026-03-15')
    });

    await Project.create({
      user: demoUser._id,
      title: 'Campus Event Ticketing API',
      description: 'Secure REST API with role-based access control, barcode ticket verification, and session authentication.',
      technologies: ['Node.js', 'Express', 'Mongoose', 'bcryptjs'],
      projectUrl: 'https://github.com/rohan-sharma/campus-events-api',
      status: 'Completed',
      completionDate: new Date('2026-01-20')
    });

    // Seed Sample Certification
    await Certification.create({
      user: demoUser._id,
      name: 'Full-Stack Web Development Specialization',
      issuer: 'Coursera / Meta',
      issueDate: new Date('2025-11-10'),
      credentialUrl: 'https://coursera.org/verify/DEMO12345'
    });


    // Seed Sample Assessment Result
    await AssessmentResult.create({
      user: demoUser._id,
      topic: 'JavaScript',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      answers: [
        {
          questionId: 'js_1',
          questionText: 'What is the output of typeof null?',
          selectedOptionIndex: 2,
          selectedOptionText: '"object"',
          correctOptionIndex: 2,
          correctOptionText: '"object"',
          isCorrect: true,
          explanation: 'typeof null returns object due to legacy implementation.'
        }
      ]
    });

    // Seed Sample Roadmap Task
    await RoadmapTask.create({
      user: demoUser._id,
      title: 'Master MongoDB Indexing & Aggregations',
      description: 'Model scalable documents using Mongoose, implement validation rules, and run aggregation pipelines.',
      reason: 'Required for Full Stack Developer at Intermediate level, but not yet added to your skill inventory.',
      priority: 'High',
      sequence: 1,
      targetDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      sourceSkill: 'MongoDB'
    });

    console.log('[Seed] Default demo student account ready.');
    return demoUser;
  } catch (err) {
    console.error('[Seed] Warning: Could not auto-seed demo student:', err.message);
  }
}

module.exports = {
  ensureDemoStudent,
  DEMO_EMAIL,
  DEMO_PASSWORD
};
