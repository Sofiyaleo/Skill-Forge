/**
 * seed.js
 * Comprehensive Database Seeder for SkillForge.
 * Populates realistic industry Career Roles, Assessments, Sample Projects,
 * Certifications, Roadmap Milestones, and demo student & admin accounts.
 * 
 * Notice: All internship tracker data has been completely removed.
 * 
 * Usage: npm run seed (or node seed.js)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Skill = require('./models/Skill');
const CareerRole = require('./models/CareerRole');
const Assessment = require('./models/Assessment');
const AssessmentResult = require('./models/AssessmentResult');
const Project = require('./models/Project');
const Certification = require('./models/Certification');
const Activity = require('./models/Activity');
const RoadmapTask = require('./models/RoadmapTask');
const UserRoadmap = require('./models/UserRoadmap');
const Application = require('./models/Application');

const { careers } = require('./data/careers');
const { topics, getQuestionsByTopic } = require('./data/questions');
const { generateUserRoadmap } = require('./services/roadmapService');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge_db';
    console.log(`⏳ Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Clean existing collections
    console.log('🧹 Cleaning old data collections...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await CareerRole.deleteMany({});
    await Assessment.deleteMany({});
    await AssessmentResult.deleteMany({});
    await Project.deleteMany({});
    await Certification.deleteMany({});
    await Activity.deleteMany({});
    await RoadmapTask.deleteMany({});
    await UserRoadmap.deleteMany({});
    await Application.deleteMany({});

    // 2. Seed Career Roles (All 7 standard career profiles)
    console.log('💼 Seeding 7 Career Profiles...');
    const insertedRoles = await CareerRole.insertMany(careers);
    console.log(`✅ Seeded ${insertedRoles.length} Career Roles.`);

    // 3. Seed Skill Assessments (5 core topics: HTML, CSS, JavaScript, SQL, CS Fundamentals)
    console.log('📝 Seeding Skill Assessments & MCQ Question Banks...');
    const assessmentDocs = [];
    for (const t of topics) {
      const qList = getQuestionsByTopic(t.id, false);
      assessmentDocs.push({
        topic: t.id,
        title: t.displayName || t.name,
        skillCategory: t.id === 'html' || t.id === 'css' || t.id === 'javascript' ? 'Frontend' : (t.id === 'sql' ? 'Database' : 'Core CS'),
        difficulty: 'Beginner',
        icon: t.icon,
        badgeColor: t.id === 'html' ? '#059669' : (t.id === 'css' ? '#0D9488' : (t.id === 'javascript' ? '#F59E0B' : (t.id === 'sql' ? '#10B981' : '#8B5CF6'))),
        durationMinutes: t.estimatedMinutes || 10,
        passingPercentage: 70,
        questions: qList.map((q, idx) => ({
          questionId: q.id || `q_${t.id}_${idx}`,
          questionText: q.question,
          options: q.options,
          correctOptionIndex: q.correctIndex,
          explanation: q.explanation || ''
        }))
      });
    }
    const insertedAssessments = await Assessment.insertMany(assessmentDocs);
    console.log(`✅ Seeded ${insertedAssessments.length} Skill Assessments.`);

    // 4. Seed Demo Users
    console.log('👤 Seeding Demo Student & Admin Accounts...');
    const demoStudentSkills = [
      { name: 'HTML5', category: 'Web Development', proficiency: 'Advanced', rating: 4, isVerified: true },
      { name: 'CSS3', category: 'Web Development', proficiency: 'Advanced', rating: 4, isVerified: true },
      { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced', rating: 4, isVerified: true },
      { name: 'Bootstrap', category: 'Web Development', proficiency: 'Intermediate', rating: 3, isVerified: true },
      { name: 'Node.js', category: 'Programming', proficiency: 'Intermediate', rating: 3, isVerified: false },
      { name: 'Express.js', category: 'Web Development', proficiency: 'Intermediate', rating: 3, isVerified: false },
      { name: 'MongoDB', category: 'Database', proficiency: 'Intermediate', rating: 3, isVerified: false },
      { name: 'Git & GitHub', category: 'Tools and Platforms', proficiency: 'Intermediate', rating: 3, isVerified: false },
      { name: 'SQL', category: 'Database', proficiency: 'Basic', rating: 2, isVerified: false },
      { name: 'Python', category: 'Programming', proficiency: 'Basic', rating: 2, isVerified: false },
      { name: 'Problem Solving', category: 'Soft Skills', proficiency: 'Intermediate', rating: 3, isVerified: false }
    ];

    const demoStudent = await User.create({
      name: 'Rohan Sharma',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      college: 'National Institute of Technology',
      degree: 'B.Tech / MCA',
      department: 'Computer Science & Engineering',
      academicYear: 'Final Year (8th Sem)',
      educationalBackground: 'Computer Science',
      targetCareer: 'Full Stack Developer',
      careerInterest: 'Full Stack Developer',
      bio: 'Motivated MCA / B.Tech student passionate about full-stack web engineering, scalable databases, and algorithms.',
      skills: demoStudentSkills
    });

    // Populate Skill collection for demo student
    for (const s of demoStudentSkills) {
      await Skill.create({
        user: demoStudent._id,
        name: s.name,
        normalizedName: s.name.trim().toLowerCase(),
        category: s.category,
        proficiency: s.proficiency,
        rating: s.rating,
        isVerified: s.isVerified
      });
    }

    const adminUser = await User.create({
      name: 'Faculty Administrator',
      email: 'admin@skillforge.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 98765 00000',
      location: 'Bangalore, India',
      college: 'National Institute of Technology',
      degree: 'Faculty / System Administrator',
      department: 'Computer Applications',
      academicYear: 'Staff',
      educationalBackground: 'Computer Science',
      targetCareer: 'Academic Administration',
      careerInterest: 'Academic Administration',
      bio: 'Department administrator supervising student skill matrices, career roles, and test verification.'
    });

    console.log(`✅ Users created: ${demoStudent.email} & ${adminUser.email}`);

    // 5. Seed Projects for Demo Student
    console.log('💻 Seeding Student Projects...');
    await Project.create([
      {
        user: demoStudent._id,
        title: 'Student Course & Portfolio Portal',
        techStack: ['Node.js', 'Express', 'MongoDB', 'Bootstrap 5'],
        technologies: ['Node.js', 'Express', 'MongoDB', 'Bootstrap 5'],
        description: 'Complete CRUD web application for managing student courses, grade records, and verified skill badges.',
        status: 'Completed',
        githubUrl: 'https://github.com/student/student-portal',
        liveUrl: 'https://student-portal.example.com',
        completionDate: new Date('2025-11-15')
      },
      {
        user: demoStudent._id,
        title: 'Modern Responsive Portfolio Website',
        techStack: ['HTML5', 'CSS3', 'JavaScript'],
        technologies: ['HTML5', 'CSS3', 'JavaScript'],
        description: 'Personal responsive portfolio showcasing projects, academic achievements, and contact form.',
        status: 'Completed',
        githubUrl: 'https://github.com/student/portfolio',
        liveUrl: 'https://student-portfolio.example.com',
        completionDate: new Date('2025-10-01')
      },
      {
        user: demoStudent._id,
        title: 'Real-time Weather Forecast Application',
        techStack: ['JavaScript', 'REST APIs', 'CSS3'],
        technologies: ['JavaScript', 'REST APIs', 'CSS3'],
        description: 'Interactive forecast web app consuming weather APIs with geolocation search and dynamic temperature charts.',
        status: 'In Progress',
        githubUrl: 'https://github.com/student/weather-app',
        liveUrl: '',
        completionDate: new Date('2026-03-01')
      }
    ]);

    // 6. Seed Certifications for Demo Student
    console.log('📜 Seeding Student Certifications...');
    await Certification.create([
      {
        user: demoStudent._id,
        title: 'JavaScript (Advanced) Specialist',
        name: 'JavaScript (Advanced) Specialist',
        issuer: 'HackerRank',
        issueDate: 'Jan 2026',
        credentialUrl: 'https://www.hackerrank.com/certificates/sample123'
      },
      {
        user: demoStudent._id,
        title: 'Full Stack Web Development Bootcamp',
        name: 'Full Stack Web Development Bootcamp',
        issuer: 'Coursera / Meta',
        issueDate: 'Dec 2025',
        credentialUrl: 'https://www.coursera.org/verify/sample456'
      }
    ]);

    // 7. Seed Assessment Results for Demo Student
    console.log('📊 Seeding Assessment Results...');
    const jsAssessment = insertedAssessments.find(a => a.topic === 'javascript') || insertedAssessments[0];
    const htmlAssessment = insertedAssessments.find(a => a.topic === 'html') || insertedAssessments[1];

    await AssessmentResult.create([
      {
        user: demoStudent._id,
        assessment: jsAssessment._id,
        topic: 'javascript',
        assessmentTitle: jsAssessment.title,
        score: 5,
        totalQuestions: 5,
        percentage: 100,
        passed: true,
        completedAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
      },
      {
        user: demoStudent._id,
        assessment: htmlAssessment._id,
        topic: 'html',
        assessmentTitle: htmlAssessment.title,
        score: 4,
        totalQuestions: 5,
        percentage: 80,
        passed: true,
        completedAt: new Date(Date.now() - 7 * 86400000) // 7 days ago
      }
    ]);

    // 8. Seed Learning Roadmap for Demo Student
    console.log('🗺️ Generating Learning Roadmap for Student...');
    const roadmapResult = await generateUserRoadmap(demoStudent._id, 'Full Stack Developer');
    
    // Mark first 2 tasks as Completed to demonstrate progress
    const studentTasks = await RoadmapTask.find({ user: demoStudent._id }).sort({ sequence: 1 });
    if (studentTasks.length > 0) {
      studentTasks[0].status = 'Completed';
      await studentTasks[0].save();
    }
    if (studentTasks.length > 1) {
      studentTasks[1].status = 'In Progress';
      await studentTasks[1].save();
    }

    // 9. Seed Recent Activities for Dashboard
    console.log('⚡ Seeding Recent Activities...');
    await Activity.create([
      {
        user: demoStudent._id,
        text: 'Completed JavaScript & Modern ES6+ Assessment (100% Score)',
        icon: 'bi-patch-check-fill',
        color: '#10B981',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      },
      {
        user: demoStudent._id,
        text: 'Marked roadmap milestone "Master Modern JavaScript" as Completed',
        icon: 'bi-check2-circle',
        color: '#059669',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        user: demoStudent._id,
        text: "Added new project 'Student Course & Portfolio Portal'",
        icon: 'bi-folder-plus',
        color: '#10B981',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000)
      },
      {
        user: demoStudent._id,
        text: 'Updated profile academic information and skills',
        icon: 'bi-person-check',
        color: '#F59E0B',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000)
      }
    ]);

    // 10. Seed Sample Internship Applications for Demo Student
    console.log('💼 Seeding Internship Applications...');
    await Application.create([
      {
        user: demoStudent._id,
        companyName: 'Google',
        roleTitle: 'Software Engineering Intern',
        location: 'Bangalore / Hybrid',
        status: 'Interviewing',
        appliedDate: new Date(Date.now() - 10 * 86400000),
        notes: 'Technical Round 1 scheduled on Friday. Review Data Structures & System Design basics.'
      },
      {
        user: demoStudent._id,
        companyName: 'Microsoft',
        roleTitle: 'Frontend Developer Intern',
        location: 'Hyderabad / Remote',
        status: 'Applied',
        appliedDate: new Date(Date.now() - 5 * 86400000),
        notes: 'Applied through university campus drive portal. Referred by Senior SWE.'
      },
      {
        user: demoStudent._id,
        companyName: 'Razorpay',
        roleTitle: 'Full Stack Web Intern',
        location: 'Bangalore',
        status: 'Offered',
        appliedDate: new Date(Date.now() - 20 * 86400000),
        notes: 'Received 6-month internship offer with 45k/month stipend! Need to accept by end of month.'
      },
      {
        user: demoStudent._id,
        companyName: 'Amazon AWS',
        roleTitle: 'Cloud & DevOps Intern',
        location: 'Chennai',
        status: 'Wishlist',
        appliedDate: new Date(),
        notes: 'Application window opens next week. Preparing AWS Certified Cloud Practitioner notes.'
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('🎉 Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Student: student@example.com / password123');
    console.log('🔑 Demo Admin:   admin@skillforge.com / adminpassword123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
