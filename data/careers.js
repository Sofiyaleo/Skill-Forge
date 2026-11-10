/**
 * Predefined Career Profiles for SkillForge
 * Used for career exploration, skill gap analysis, and roadmap generation.
 */

const PROFICIENCY_LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

const PROFICIENCY_RANKS = {
  Beginner: 1,
  Basic: 2,
  Intermediate: 3,
  Advanced: 4,
  Expert: 5
};

const careers = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    icon: 'bi-code-slash',
    description: 'Designs and builds responsive, interactive client-side interfaces and user experiences for web applications using modern web technologies and frameworks.',
    responsibilities: [
      'Translate UI/UX wireframes and mockups into clean, high-performance HTML/CSS/JS code',
      'Optimize web applications for maximum speed, accessibility, and scalability across devices',
      'Integrate client-side applications with RESTful and GraphQL APIs',
      'Maintain code quality through responsive testing, cross-browser compatibility, and modular architecture'
    ],
    requiredSkills: [
      { name: 'HTML5', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'CSS3', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'JavaScript', category: 'Programming', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Bootstrap', category: 'Web Development', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'Git & GitHub', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Responsive Web Design', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'REST APIs', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Web Performance Optimization', category: 'Web Development', minProficiency: 'Basic', importance: 'Medium' }
    ],
    suggestedProjects: [
      {
        title: 'Responsive SaaS Landing & Dashboard UI',
        description: 'Build a mobile-first dashboard with dark/light mode toggle, dynamic data filtering, and responsive charts.'
      },
      {
        title: 'Interactive E-Commerce Product Catalog',
        description: 'Implement product search, category filtering, cart state management, and modal product quick-views.'
      },
      {
        title: 'Live Weather & Forecast Web App',
        description: 'Consume public weather APIs to render live forecasts, geolocation queries, and responsive weather charts.'
      }
    ],
    recommendedTopics: [
      'Modern JavaScript (ES6+ array methods, async/await, closures)',
      'CSS Flexbox, CSS Grid, and responsive media queries',
      'DOM Manipulation and Event Delegation',
      'Fetch API and asynchronous error handling',
      'Web accessibility (ARIA labels, keyboard navigation, semantic markup)'
    ]
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    icon: 'bi-server',
    description: 'Architects, builds, and maintains server-side logic, database schemas, secure authentication mechanisms, and robust REST APIs that power client applications.',
    responsibilities: [
      'Design and implement secure, RESTful APIs and server architectures',
      'Model and optimize relational and NoSQL database schemas',
      'Implement authentication, authorization, session management, and data encryption',
      'Handle error logging, rate limiting, and server deployment pipelines'
    ],
    requiredSkills: [
      { name: 'Node.js', category: 'Programming', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Express.js', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'MongoDB', category: 'Database', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'SQL', category: 'Database', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'REST APIs', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Authentication & Security', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Git & GitHub', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Postman / API Testing', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'Medium' }
    ],
    suggestedProjects: [
      {
        title: 'Secure Multi-Tenant Auth & Role API',
        description: 'Build a JWT and session-based authentication microservice with role-based access control, password hashing, and rate limiting.'
      },
      {
        title: 'Task Management REST API with MongoDB',
        description: 'Develop full CRUD endpoints with Mongoose, data filtering, pagination, and file attachment handling.'
      },
      {
        title: 'Real-time Chat or Notification Service',
        description: 'Implement WebSocket connections for real-time messaging, presence indicators, and message history storage.'
      }
    ],
    recommendedTopics: [
      'Node.js Event Loop, asynchronous non-blocking I/O, and Streams',
      'Express routing, middleware architecture, and error propagation',
      'Mongoose schema validation, indexes, and aggregation pipelines',
      'Password hashing with bcrypt and session vs token security',
      'HTTP status codes and REST architectural constraints'
    ]
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Engineering',
    icon: 'bi-layers',
    description: 'Bridges frontend and backend engineering, handling everything from user interface design to database schema modeling, server business logic, and API integration.',
    responsibilities: [
      'Build end-to-end web applications from UI prototypes to backend databases',
      'Design clean database schemas and integrate Mongoose/SQL models',
      'Implement secure user authentication, authorization, and session persistence',
      'Deploy and maintain cloud or server hosted applications'
    ],
    requiredSkills: [
      { name: 'JavaScript', category: 'Programming', minProficiency: 'Advanced', importance: 'High' },
      { name: 'HTML5', category: 'Web Development', minProficiency: 'Advanced', importance: 'High' },
      { name: 'CSS3', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Node.js', category: 'Programming', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Express.js', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'MongoDB', category: 'Database', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Git & GitHub', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Bootstrap', category: 'Web Development', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'REST APIs', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' }
    ],
    suggestedProjects: [
      {
        title: 'College Course & Skill Marketplace',
        description: 'Complete full-stack platform with student profiles, course enrollment, ratings, and mentor booking.'
      },
      {
        title: 'Issue & Bug Tracker with Kanban Board',
        description: 'Full-stack application featuring drag-and-drop workflow status, team assignments, and activity audit trails.'
      },
      {
        title: 'Personal Portfolio & Resume Generator',
        description: 'Dynamic platform enabling users to input career assets and generate live printable resumes and hosted portfolio pages.'
      }
    ],
    recommendedTopics: [
      'Full-stack MVC architecture and separation of concerns',
      'Server-side rendering with EJS templates and component partials',
      'Database normalization, indexing, and Mongoose references',
      'Cross-Site Request Forgery (CSRF) and Content Security Policies',
      'Git workflows: branching, merging, and pull request reviews'
    ]
  },
  {
    id: 'software-developer',
    title: 'Software Developer',
    category: 'Engineering',
    icon: 'bi-cpu',
    description: 'Applies foundational computer science principles, data structures, and algorithms to develop reliable, high-performance desktop, system, or enterprise software.',
    responsibilities: [
      'Write modular, well-tested, and efficient code in primary object-oriented or systems languages',
      'Analyze computational complexity and optimize data structures and algorithms',
      'Collaborate on software architecture design patterns and technical documentation',
      'Debug, profile, and refactor existing codebases for reliability and speed'
    ],
    requiredSkills: [
      { name: 'Data Structures & Algorithms', category: 'Problem Solving', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Object-Oriented Programming', category: 'Programming', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Java', category: 'Programming', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'SQL', category: 'Database', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'Git & GitHub', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Software Design Patterns', category: 'Problem Solving', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'Unit Testing', category: 'Tools and Platforms', minProficiency: 'Basic', importance: 'Medium' }
    ],
    suggestedProjects: [
      {
        title: 'Inventory & Billing Management System',
        description: 'Build an OOP-based system with database persistence, transaction management, and automated report generation.'
      },
      {
        title: 'Custom In-Memory Caching Library',
        description: 'Implement LRU/LFU cache eviction policies with thread safety and benchmarking.'
      },
      {
        title: 'Algorithm Visualizer Suite',
        description: 'Visual demonstration of pathfinding (Dijkstra, A*) and sorting algorithms with step-by-step playback.'
      }
    ],
    recommendedTopics: [
      'Time and space complexity analysis (Big-O notation)',
      'Trees, graphs, heaps, hash tables, and dynamic programming',
      'SOLID principles and clean code practices',
      'Relational database ACID transactions and indexing',
      'Automated testing strategies: unit, integration, and regression'
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    icon: 'bi-graph-up-arrow',
    description: 'Inspects, cleans, transforms, and models data to uncover actionable insights, forecast trends, and communicate findings through interactive visualizations and dashboards.',
    responsibilities: [
      'Extract and transform data from diverse databases and operational systems using SQL',
      'Perform exploratory data analysis and statistical validation',
      'Create interactive dashboards and executive KPI reports',
      'Present findings and data-driven recommendations to stakeholders'
    ],
    requiredSkills: [
      { name: 'SQL', category: 'Database', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Python', category: 'Programming', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Data Analysis', category: 'Data Analysis', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Excel / Spreadsheets', category: 'Tools and Platforms', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Tableau / Power BI', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'Communication', category: 'Communication', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Statistics & Probability', category: 'Data Analysis', minProficiency: 'Intermediate', importance: 'Medium' }
    ],
    suggestedProjects: [
      {
        title: 'Retail Sales & Profitability Dashboard',
        description: 'Analyze multi-year transactional datasets to identify customer segments, seasonal trends, and profit margins.'
      },
      {
        title: 'Student Performance & Retention Analysis',
        description: 'Identify leading indicators of academic difficulty using correlation analysis and interactive charts.'
      },
      {
        title: 'COVID-19 / Healthcare Metric Visualizer',
        description: 'Clean public epidemiological data and visualize infection trajectories, vaccination rates, and hospital capacity.'
      }
    ],
    recommendedTopics: [
      'Complex SQL queries: Window functions, CTEs, self-joins, and aggregations',
      'Python libraries: Pandas dataframes, NumPy, and Matplotlib/Seaborn',
      'Data cleaning: Handling missing values, outliers, and data type formatting',
      'Descriptive and inferential statistics',
      'Effective data storytelling and visual hierarchy'
    ]
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Design',
    icon: 'bi-palette',
    description: 'Researches user needs, crafts user personas, designs information architecture, and creates high-fidelity wireframes, interactive prototypes, and design systems.',
    responsibilities: [
      'Conduct user interviews, usability audits, and competitive research',
      'Design wireframes, user task flows, and interactive clickable prototypes',
      'Maintain unified design systems including color palettes, typography, and component libraries',
      'Collaborate with developers to ensure accurate visual and interactive implementation'
    ],
    requiredSkills: [
      { name: 'Figma', category: 'Design', minProficiency: 'Advanced', importance: 'High' },
      { name: 'UI/UX Design', category: 'Design', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Wireframing & Prototyping', category: 'Design', minProficiency: 'Advanced', importance: 'High' },
      { name: 'User Research', category: 'Design', minProficiency: 'Intermediate', importance: 'Medium' },
      { name: 'HTML5 & CSS3 Basics', category: 'Web Development', minProficiency: 'Basic', importance: 'Medium' },
      { name: 'Design Systems', category: 'Design', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Communication', category: 'Communication', minProficiency: 'Advanced', importance: 'High' }
    ],
    suggestedProjects: [
      {
        title: 'FinTech Mobile Banking Experience Case Study',
        description: 'Complete UX case study featuring user persona definition, wireframing, high-fidelity prototypes, and usability testing.'
      },
      {
        title: 'Design System for College EdTech Portal',
        description: 'Comprehensive UI component library in Figma covering typography tokens, buttons, inputs, and navigation elements.'
      },
      {
        title: 'Redesign of Healthcare Appointment Booking App',
        description: 'End-to-end redesign focused on reducing booking drop-off rates and improving accessibility for elderly users.'
      }
    ],
    recommendedTopics: [
      'Design thinking methodology and empathy mapping',
      'Figma auto-layout, component variants, and interactive states',
      'Accessibility standards (WCAG 2.1 color contrast and legibility)',
      'Information architecture and card sorting techniques',
      'Creating comprehensive developer handoff documentation'
    ]
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Security',
    icon: 'bi-shield-check',
    description: 'Monitors, detects, investigates, and defends IT networks and applications against unauthorized access, vulnerabilities, data breaches, and cyber threats.',
    responsibilities: [
      'Conduct vulnerability assessments, network traffic analysis, and log audits',
      'Implement defensive configurations, firewalls, and endpoint security measures',
      'Respond to security incidents, analyze malware behavior, and draft incident reports',
      'Promote security awareness and enforce compliance with data protection policies'
    ],
    requiredSkills: [
      { name: 'Network Fundamentals', category: 'Tools and Platforms', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Linux Command Line', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Cybersecurity Fundamentals', category: 'Tools and Platforms', minProficiency: 'Advanced', importance: 'High' },
      { name: 'Vulnerability Assessment', category: 'Tools and Platforms', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Python Basics', category: 'Programming', minProficiency: 'Basic', importance: 'Medium' },
      { name: 'Web Application Security (OWASP)', category: 'Web Development', minProficiency: 'Intermediate', importance: 'High' },
      { name: 'Problem Solving', category: 'Problem Solving', minProficiency: 'Advanced', importance: 'High' }
    ],
    suggestedProjects: [
      {
        title: 'Home Lab Network Intrusion Detection Setup',
        description: 'Configure an in-home virtual lab with Snort or Suricata IDS, analyzing simulated port scans and attack traffic.'
      },
      {
        title: 'OWASP Top 10 Vulnerability Audit Report',
        description: 'Perform a comprehensive vulnerability audit on an intentionally vulnerable web application (e.g. DVWA) with remediation patches.'
      },
      {
        title: 'Automated Port Scanner & Log Analyzer Script',
        description: 'Write a Python automation script that scans network subnets and flags unpatched open ports.'
      }
    ],
    recommendedTopics: [
      'OSI model, TCP/IP handshake, DNS, and HTTP/HTTPS protocols',
      'OWASP Top 10 web vulnerabilities (SQLi, XSS, CSRF, Broken Auth)',
      'Linux permissions, syslog analysis, and shell scripting',
      'Symmetric vs asymmetric encryption and digital certificates',
      'Incident response lifecycle and threat intelligence basics'
    ]
  }
];

// Helper to look up a career by ID or title
function getCareerById(id) {
  if (!id) return null;
  const raw = id.toString().trim().toLowerCase();
  const normalizedId = raw.replace(/\s+/g, '-');
  if (normalizedId === 'web-developer') {
    return careers.find(c => c.id === 'full-stack-developer') || careers[0];
  }
  return careers.find(c => c.id === normalizedId || c.title.toLowerCase() === raw) || null;
}

module.exports = {
  careers,
  PROFICIENCY_LEVELS,
  PROFICIENCY_RANKS,
  getCareerById
};
