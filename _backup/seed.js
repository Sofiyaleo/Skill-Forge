/**
 * seed.js
 * Comprehensive Database Seeder for SkillForge.
 * Populates realistic industry Career Roles, Assessments, Sample Projects,
 * Sample Applications, and demo accounts (student and admin).
 * 
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CareerRole = require('./models/CareerRole');
const Assessment = require('./models/Assessment');
const Project = require('./models/Project');
const Certification = require('./models/Certification');
const Application = require('./models/Application');
const Activity = require('./models/Activity');
const UserRoadmap = require('./models/UserRoadmap');

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing collections
    console.log('🧹 Cleaning old data...');
    await User.deleteMany({});
    await CareerRole.deleteMany({});
    await Assessment.deleteMany({});
    await Project.deleteMany({});
    await Certification.deleteMany({});
    await Application.deleteMany({});
    await Activity.deleteMany({});
    await UserRoadmap.deleteMany({});

    // 2. Create Users
    console.log('👤 Seeding Users...');
    const demoStudent = await User.create({
      name: 'Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      education: 'B.Tech / MCA in Computer Science - ABC College',
      careerInterest: 'Web Developer',
      bio: 'Motivated MCA student dedicated to mastering full-stack web engineering, algorithms, and cloud systems.',
      skills: [
        { name: 'HTML', category: 'Frontend', rating: 4, isVerified: true },
        { name: 'CSS', category: 'Frontend', rating: 4, isVerified: true },
        { name: 'JavaScript', category: 'Frontend', rating: 3, isVerified: true },
        { name: 'Python', category: 'Backend', rating: 2, isVerified: false },
        { name: 'React', category: 'Frontend', rating: 2, isVerified: false },
        { name: 'Node.js', category: 'Backend', rating: 1, isVerified: false },
        { name: 'SQL', category: 'Database', rating: 3, isVerified: false },
        { name: 'Git', category: 'DevOps', rating: 2, isVerified: false },
        { name: 'MongoDB', category: 'Database', rating: 3, isVerified: false },
        { name: 'Bootstrap', category: 'Frontend', rating: 4, isVerified: true },
        { name: 'Express.js', category: 'Backend', rating: 2, isVerified: false },
        { name: 'Data Structures', category: 'Other', rating: 3, isVerified: false }
      ]
    });

    const adminUser = await User.create({
      name: 'Admin Faculty',
      email: 'admin@skillforge.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 98765 00000',
      location: 'Bangalore, India',
      education: 'Faculty / System Administrator',
      careerInterest: 'Academic Administration',
      bio: 'College platform administrator supervising student skill matrices, career roles, and assessments.'
    });

    console.log(`✅ Users created: ${demoStudent.email} & ${adminUser.email}`);

    // 3. Seed Career Roles (Matching Panel 6 in screenshot)
    console.log('💼 Seeding Career Roles...');
    const careerRoles = [
      {
        title: 'Web Developer',
        category: 'Tech',
        description: 'Build and maintain modern websites. Front-end and back-end integration with scalable databases.',
        averageSalary: '₹6 - 12 LPA',
        requiredSkills: [
          { name: 'HTML', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'CSS', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'JavaScript', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'React', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Node.js', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Git', requiredLevel: 2, importance: 'Must-Have' },
          { name: 'MongoDB', requiredLevel: 3, importance: 'Good-To-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Basics',
            tasks: [
              { taskId: 'task-1', title: 'Learn HTML5 Fundamentals & Semantic Tags', description: 'Master layout tags, forms, tables, and accessibility standards.', defaultStatus: 'Completed' },
              { taskId: 'task-2', title: 'Complete CSS Layout Practice (Flexbox & Grid)', description: 'Build responsive web page layouts with pure CSS and Bootstrap 5.', defaultStatus: 'Completed' },
              { taskId: 'task-3', title: 'JavaScript Basics (Variables, Functions, Loops)', description: 'Understand ES6 syntax, arrays, objects, and arrow functions.', defaultStatus: 'In Progress' },
              { taskId: 'task-4', title: 'Build a Small DOM Manipulation Project', description: 'Create an interactive calculator or to-do list with event listeners.', defaultStatus: 'To Do' },
              { taskId: 'task-5', title: 'Take JavaScript Skill Assessment', description: 'Test baseline knowledge and earn verification badge.', defaultStatus: 'To Do' }
            ]
          },
          {
            stepOrder: 2,
            weekTitle: 'Week 3-4: Advanced Topics',
            tasks: [
              { taskId: 'task-6', title: 'Asynchronous JavaScript & Promises', description: 'Master async/await, fetch API, and JSON handling.', defaultStatus: 'To Do' },
              { taskId: 'task-7', title: 'Git & Version Control Essentials', description: 'Learn branches, commits, pull requests, and GitHub collaboration.', defaultStatus: 'To Do' },
              { taskId: 'task-8', title: 'Node.js & Express.js Backend Architecture', description: 'Build REST APIs with routing, middleware, and status codes.', defaultStatus: 'To Do' }
            ]
          },
          {
            stepOrder: 3,
            weekTitle: 'Week 5-6: Frameworks & Tools',
            tasks: [
              { taskId: 'task-9', title: 'React Component Hierarchy & State', description: 'Understand props, useState, and useEffect hooks.', defaultStatus: 'To Do' },
              { taskId: 'task-10', title: 'Database Integration with MongoDB & Mongoose', description: 'Design schemas, write queries, and perform full CRUD.', defaultStatus: 'To Do' },
              { taskId: 'task-11', title: 'Deploy Full Stack Application to Cloud', description: 'Host frontend and backend on Render, Vercel, or AWS.', defaultStatus: 'To Do' }
            ]
          }
        ]
      },
      {
        title: 'Data Analyst',
        category: 'Data',
        description: 'Analyze data to help make better business decisions and generate actionable visualizations.',
        averageSalary: '₹5 - 10 LPA',
        requiredSkills: [
          { name: 'Excel', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'SQL', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'Python', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Data Visualization', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Statistics', requiredLevel: 3, importance: 'Good-To-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Data Wrangling & SQL',
            tasks: [
              { taskId: 'da-1', title: 'Advanced Excel & Pivot Tables', description: 'Master VLOOKUP, XLOOKUP, and conditional formatting.', defaultStatus: 'To Do' },
              { taskId: 'da-2', title: 'SQL Queries, Joins, and Aggregations', description: 'Extract and transform structured data from relational databases.', defaultStatus: 'To Do' }
            ]
          },
          {
            stepOrder: 2,
            weekTitle: 'Week 3-4: Python for Analytics',
            tasks: [
              { taskId: 'da-3', title: 'NumPy & Pandas Data Manipulation', description: 'Clean data frames, handle nulls, and format series.', defaultStatus: 'To Do' },
              { taskId: 'da-4', title: 'Data Visualization with Matplotlib & Seaborn', description: 'Create line charts, bar plots, and correlation heatmaps.', defaultStatus: 'To Do' }
            ]
          }
        ]
      },
      {
        title: 'Software Developer',
        category: 'Tech',
        description: 'Design and build enterprise software applications, algorithms, and microservices.',
        averageSalary: '₹7 - 14 LPA',
        requiredSkills: [
          { name: 'Java', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'Python', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Git', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Data Structures', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'OOP Concepts', requiredLevel: 4, importance: 'Must-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Core Programming & OOP',
            tasks: [
              { taskId: 'sd-1', title: 'Object-Oriented Programming Principles', description: 'Master Encapsulation, Inheritance, Polymorphism, and Abstraction.', defaultStatus: 'To Do' },
              { taskId: 'sd-2', title: 'Essential Data Structures (Arrays, Linked Lists)', description: 'Implement basic structures and measure space-time complexity.', defaultStatus: 'To Do' }
            ]
          }
        ]
      },
      {
        title: 'UI/UX Designer',
        category: 'Design',
        description: 'Create user-friendly interfaces, design wireframes, and craft intuitive design systems.',
        averageSalary: '₹5 - 11 LPA',
        requiredSkills: [
          { name: 'Figma', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'Wireframing', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'HTML', requiredLevel: 3, importance: 'Good-To-Have' },
          { name: 'CSS', requiredLevel: 3, importance: 'Good-To-Have' },
          { name: 'User Research', requiredLevel: 3, importance: 'Must-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Design Fundamentals',
            tasks: [
              { taskId: 'ux-1', title: 'Figma Auto-layout and Components', description: 'Build reusable UI design kits and tokens.', defaultStatus: 'To Do' }
            ]
          }
        ]
      },
      {
        title: 'Mobile App Developer',
        category: 'Tech',
        description: 'Build native and cross-platform mobile applications for Android and iOS devices.',
        averageSalary: '₹6 - 13 LPA',
        requiredSkills: [
          { name: 'React Native', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'JavaScript', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'Mobile UI Design', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'API Integration', requiredLevel: 3, importance: 'Must-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Mobile Foundations',
            tasks: [
              { taskId: 'mad-1', title: 'React Native Components & Navigation', description: 'Build multi-screen mobile experiences.', defaultStatus: 'To Do' }
            ]
          }
        ]
      },
      {
        title: 'Cybersecurity Analyst',
        category: 'Tech',
        description: 'Protect systems, servers, networks, and confidential data from cyber threats and intrusions.',
        averageSalary: '₹6 - 14 LPA',
        requiredSkills: [
          { name: 'Networking', requiredLevel: 4, importance: 'Must-Have' },
          { name: 'Linux', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Security Tools', requiredLevel: 3, importance: 'Must-Have' },
          { name: 'Python', requiredLevel: 2, importance: 'Good-To-Have' }
        ],
        roadmapSteps: [
          {
            stepOrder: 1,
            weekTitle: 'Week 1-2: Network Security Fundamentals',
            tasks: [
              { taskId: 'cs-1', title: 'TCP/IP Model and Wireshark Packet Analysis', description: 'Inspect network traffic and analyze protocols.', defaultStatus: 'To Do' }
            ]
          }
        ]
      }
    ];

    await CareerRole.insertMany(careerRoles);
    console.log(`✅ Seeded ${careerRoles.length} Career Roles.`);

    // 4. Seed Assessments (Matching Panel 9 in screenshot)
    console.log('📝 Seeding Skill Assessments & MCQs...');
    const assessments = [
      {
        title: 'HTML & CSS Fundamentals',
        skillCategory: 'Frontend',
        difficulty: 'Beginner',
        icon: 'bi-filetype-html',
        badgeColor: '#0EA5E9',
        durationMinutes: 15,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'Which HTML5 element is used to specify a navigation section?',
            options: ['<nav>', '<navigate>', '<section-nav>', '<header-nav>'],
            correctOptionIndex: 0,
            explanation: '<nav> is the standard semantic HTML5 element for major navigation links.'
          },
          {
            questionText: 'Which CSS property is used to create a flex container?',
            options: ['flex: 1', 'display: flex', 'float: flex', 'align-content: flex'],
            correctOptionIndex: 1,
            explanation: 'Setting display: flex creates a flex formatting context.'
          },
          {
            questionText: 'What does CSS Box-Sizing: border-box do?',
            options: [
              'Includes padding and border in the element total width and height',
              'Excludes margins from the width calculation only',
              'Removes all borders from child elements',
              'Makes the element circular automatically'
            ],
            correctOptionIndex: 0,
            explanation: 'border-box tells the browser to account for any border and padding in the values you specify for an element width and height.'
          },
          {
            questionText: 'Which tag is used to embed an external stylesheet in HTML?',
            options: ['<style src="...">', '<link rel="stylesheet" href="...">', '<css link="...">', '<script href="...">'],
            correctOptionIndex: 1,
            explanation: 'The <link rel="stylesheet"> tag embeds external CSS files.'
          },
          {
            questionText: 'In Bootstrap 5, how many columns exist in a default grid row?',
            options: ['8', '10', '12', '16'],
            correctOptionIndex: 2,
            explanation: 'Bootstrap 5 uses a standard 12-column responsive grid system.'
          }
        ]
      },
      {
        title: 'JavaScript Basics',
        skillCategory: 'Frontend',
        difficulty: 'Beginner',
        icon: 'bi-filetype-js',
        badgeColor: '#F59E0B',
        durationMinutes: 15,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'Which keyword defines a block-scoped variable that can be reassigned in JavaScript?',
            options: ['var', 'let', 'const', 'global'],
            correctOptionIndex: 1,
            explanation: 'let defines block-scoped reassignable variables; const cannot be reassigned.'
          },
          {
            questionText: 'What is the output of typeof null in JavaScript?',
            options: ['"null"', '"undefined"', '"object"', '"number"'],
            correctOptionIndex: 2,
            explanation: 'In JavaScript, typeof null returns "object" due to a historic legacy implementation.'
          },
          {
            questionText: 'Which array method creates a new array with the results of calling a provided function on every element?',
            options: ['forEach()', 'map()', 'filter()', 'reduce()'],
            correctOptionIndex: 1,
            explanation: 'Array.prototype.map() returns a new array after applying a transform function.'
          },
          {
            questionText: 'What will "5" + 2 evaluate to in JavaScript?',
            options: ['7', '"52"', 'NaN', 'TypeError'],
            correctOptionIndex: 1,
            explanation: 'The + operator coerces the number into a string and concatenates them into "52".'
          },
          {
            questionText: 'Which function parses a JSON string into a JavaScript object?',
            options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'JSON.encode()'],
            correctOptionIndex: 1,
            explanation: 'JSON.parse() deserializes valid JSON text into JavaScript objects.'
          }
        ]
      },
      {
        title: 'React Basics',
        skillCategory: 'Frontend',
        difficulty: 'Intermediate',
        icon: 'bi-code-square',
        badgeColor: '#6366F1',
        durationMinutes: 20,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'Which React hook is used to manage local component state in functional components?',
            options: ['useEffect', 'useState', 'useContext', 'useReducer'],
            correctOptionIndex: 1,
            explanation: 'useState declares a state variable and its updater function.'
          },
          {
            questionText: 'What is JSX in React?',
            options: ['A database query language', 'A JavaScript syntax extension that resembles HTML', 'A CSS preprocessor', 'A build tool like Webpack'],
            correctOptionIndex: 1,
            explanation: 'JSX allows writing HTML-like syntax inside JavaScript files.'
          }
        ]
      },
      {
        title: 'Node.js Fundamentals',
        skillCategory: 'Backend',
        difficulty: 'Intermediate',
        icon: 'bi-hdd-network',
        badgeColor: '#10B981',
        durationMinutes: 20,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'What engine does Node.js use to execute JavaScript code?',
            options: ['SpiderMonkey', 'V8 Engine', 'Chakra', 'JavaScriptCore'],
            correctOptionIndex: 1,
            explanation: 'Node.js is built on Chrome V8 JavaScript engine.'
          },
          {
            questionText: 'In Express.js, what does the next() function do?',
            options: [
              'Terminates the HTTP request immediately',
              'Passes control to the next middleware function in the stack',
              'Restarts the Express application',
              'Sends a 404 response to the client'
            ],
            correctOptionIndex: 1,
            explanation: 'Calling next() hands execution over to the subsequent middleware.'
          }
        ]
      },
      {
        title: 'Data Structures & Algorithms',
        skillCategory: 'Core CS',
        difficulty: 'Intermediate',
        icon: 'bi-diagram-3',
        badgeColor: '#EC4899',
        durationMinutes: 20,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'What is the time complexity of accessing an element by index in an array?',
            options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
            correctOptionIndex: 1,
            explanation: 'Array index access is instantaneous and operates in constant time O(1).'
          },
          {
            questionText: 'Which data structure operates on a First-In-First-Out (FIFO) principle?',
            options: ['Stack', 'Queue', 'Binary Tree', 'Priority Heap'],
            correctOptionIndex: 1,
            explanation: 'A Queue adheres to FIFO, where the first element added is the first one removed.'
          }
        ]
      },
      {
        title: 'Python Basics',
        skillCategory: 'Backend',
        difficulty: 'Beginner',
        icon: 'bi-terminal',
        badgeColor: '#0D9488',
        durationMinutes: 15,
        passingPercentage: 70,
        questions: [
          {
            questionText: 'Which symbol is used for single-line comments in Python?',
            options: ['//', '/*', '#', '--'],
            correctOptionIndex: 2,
            explanation: 'The hash symbol # indicates a single-line comment in Python.'
          },
          {
            questionText: 'Which Python data type is immutable?',
            options: ['List', 'Dictionary', 'Tuple', 'Set'],
            correctOptionIndex: 2,
            explanation: 'Tuples cannot be altered after creation (immutable).'
          }
        ]
      }
    ];

    await Assessment.insertMany(assessments);
    console.log(`✅ Seeded ${assessments.length} Skill Assessments.`);

    // 5. Seed Projects for Demo Student (Matching Panel 10 in screenshot)
    console.log('💻 Seeding Student Projects...');
    await Project.create([
      {
        user: demoStudent._id,
        title: 'Portfolio Website',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        description: 'Personal responsive portfolio showcasing projects, academic achievements, and contact form.',
        status: 'Completed',
        githubUrl: 'https://github.com/student/portfolio',
        liveUrl: 'https://student-portfolio.example.com'
      },
      {
        user: demoStudent._id,
        title: 'Student Management System',
        techStack: ['Node.js', 'Express', 'MongoDB'],
        description: 'Complete CRUD web application for managing student enrollments, course catalogs, and grade records.',
        status: 'Completed',
        githubUrl: 'https://github.com/student/student-management',
        liveUrl: 'https://student-mgmt.example.com'
      },
      {
        user: demoStudent._id,
        title: 'Weather App',
        techStack: ['JavaScript', 'REST API', 'CSS3'],
        description: 'Real-time weather forecast application consuming OpenWeatherMap API with location search.',
        status: 'In Progress',
        githubUrl: 'https://github.com/student/weather-app',
        liveUrl: ''
      }
    ]);

    // 6. Seed Certifications for Demo Student (Matching Panel 10 in screenshot)
    console.log('📜 Seeding Student Certifications...');
    await Certification.create([
      {
        user: demoStudent._id,
        title: 'JavaScript (Basic)',
        issuer: 'HackerRank',
        issueDate: 'Apr 2025',
        credentialUrl: 'https://www.hackerrank.com/certificates/sample123'
      },
      {
        user: demoStudent._id,
        title: 'Web Development Bootcamp',
        issuer: 'Udemy',
        issueDate: 'Mar 2025',
        credentialUrl: 'https://www.udemy.com/certificate/sample456'
      }
    ]);

    // 7. Seed Internship Applications for Demo Student (Matching Panel 11 in screenshot)
    console.log('🏢 Seeding Internship Applications...');
    await Application.create([
      {
        user: demoStudent._id,
        companyName: 'TCS',
        roleTitle: 'Web Developer',
        location: 'Bangalore, India',
        status: 'Applied',
        appliedDate: 'Apr 5, 2025',
        notes: 'Submitted online assessment and resume. Awaiting technical screening.'
      },
      {
        user: demoStudent._id,
        companyName: 'Infosys',
        roleTitle: 'Frontend Developer',
        location: 'Mysore (Hybrid)',
        status: 'Interviewing',
        appliedDate: 'Apr 12, 2025',
        notes: 'Cleared Round 1 coding round. Round 2 technical interview scheduled.'
      },
      {
        user: demoStudent._id,
        companyName: 'Wipro',
        roleTitle: 'Data Analyst',
        location: 'Hyderabad',
        status: 'Offered',
        appliedDate: 'Apr 18, 2025',
        notes: 'Received summer internship offer letter! Stipend: ₹25,000/month.'
      },
      {
        user: demoStudent._id,
        companyName: 'Accenture',
        roleTitle: 'Software Developer',
        location: 'Pune',
        status: 'Rejected',
        appliedDate: 'Apr 24, 2025',
        notes: 'Position closed due to team budget reallocations.'
      },
      {
        user: demoStudent._id,
        companyName: 'Google',
        roleTitle: 'Software Engineering Intern',
        location: 'Bangalore',
        status: 'Wishlist',
        appliedDate: 'May 1, 2025',
        notes: 'Application opens next month. Preparing LeetCode tree problems.'
      }
    ]);

    // 8. Seed Recent Activities for Dashboard (Matching Panel 4 in screenshot)
    console.log('⚡ Seeding Recent Activities...');
    await Activity.create([
      {
        user: demoStudent._id,
        text: 'Completed JavaScript Assessment',
        icon: 'bi-patch-check-fill',
        color: '#6366F1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        user: demoStudent._id,
        text: "Added new project 'Portfolio Website'",
        icon: 'bi-folder-plus',
        color: '#10B981',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user: demoStudent._id,
        text: 'Updated your profile',
        icon: 'bi-person-check',
        color: '#F59E0B',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: demoStudent._id,
        text: 'Applied for Web Developer Internship at TCS',
        icon: 'bi-briefcase',
        color: '#EC4899',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
      }
    ]);

    // 9. Seed Roadmap Progress for Student
    await UserRoadmap.create({
      user: demoStudent._id,
      roleTitle: 'Web Developer',
      completedTaskIds: ['task-1', 'task-2', 'task-6', 'task-7', 'task-9', 'task-10'] // 6 tasks completed out of 21 (29%)
    });

    console.log('🎉 Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Student Login: student@example.com / password123');
    console.log('🔑 Admin Login:   admin@skillforge.com / adminpassword123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
