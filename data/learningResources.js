/**
 * data/learningResources.js
 * Curated, industry-standard Learning Guidance and Task Specifications.
 * Powers the rule-based Personalized Learning Roadmap engine with actionable
 * career advice, deliverables, completion criteria, and verified documentation links.
 */

const skillRecommendations = {
  'javascript': {
    title: 'Master Modern JavaScript & Asynchronous Programming',
    description: 'Build a rigorous grasp of ES6+ syntax, closures, promises, async/await, and event-driven patterns through practical hands-on exercises.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'JavaScript is the fundamental programming language of the modern web, essential for both browser interactivity and scalable server-side Node.js applications.',
    whatToLearn: [
      'ES6+ syntax (destructuring, spread/rest, arrow functions, modules)',
      'Closures, lexical scope, and execution context',
      'Asynchronous JavaScript: Promises, Async/Await, and try/catch',
      'DOM API manipulation, event bubbling, and custom events',
      'JSON serialization and Fetch API HTTP client communication'
    ],
    whatToPractice: [
      'Refactor legacy callback-based scripts into clean async/await pipelines',
      'Write utility functions utilizing Array.map, filter, and reduce without mutating source state',
      'Build an interactive modal dialog and dropdown menu using vanilla event listeners'
    ],
    deliverable: 'Interactive API-driven Web Dashboard with live filtering, sorting, and persistent local storage.',
    completionCriteria: 'Code handles network errors gracefully, operates without console errors, and passes the SkillForge JavaScript assessment with 70%+.',
    estimatedEffort: '15 - 20 hours',
    durationDays: 14,
    priority: 'High',
    learningResources: [
      { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
      { title: 'JavaScript.info Complete Tutorial', url: 'https://javascript.info' }
    ]
  },
  'html': {
    title: 'Semantic HTML5 Architecture & Accessible Forms',
    description: 'Structure modern web pages using semantic HTML elements, accessible form controls, and SEO-friendly document layouts.',
    phase: 'Phase 1 — Foundation',
    whyItMatters: 'Semantic HTML provides the structural foundation for all web applications, ensuring high accessibility for screen readers and optimal SEO ranking.',
    whatToLearn: [
      'HTML5 semantic landmarks (<header>, <nav>, <main>, <section>, <article>, <footer>)',
      'Form controls, input types, regex validation patterns, and label associations',
      'ARIA attributes (roles, aria-expanded, aria-hidden)',
      'Meta viewport tags and OpenGraph document metadata'
    ],
    whatToPractice: [
      'Audit an existing web page using browser accessibility dev tools and Lighthouse',
      'Build a multi-section registration form with client-side pattern validation'
    ],
    deliverable: 'W3C-compliant semantic multi-page website template featuring accessible forms and keyboard navigation.',
    completionCriteria: 'HTML validates with 0 errors on the official W3C validator and achieves a 95+ score on Google Lighthouse Accessibility.',
    estimatedEffort: '8 - 10 hours',
    durationDays: 7,
    priority: 'Medium',
    learningResources: [
      { title: 'MDN HTML Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { title: 'W3C Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' }
    ]
  },
  'html5': {
    title: 'Semantic HTML5 Architecture & Accessible Forms',
    description: 'Structure modern web pages using semantic HTML elements, accessible form controls, and SEO-friendly document layouts.',
    phase: 'Phase 1 — Foundation',
    whyItMatters: 'Semantic HTML provides the structural foundation for all web applications, ensuring high accessibility for screen readers and optimal SEO ranking.',
    whatToLearn: [
      'HTML5 semantic landmarks (<header>, <nav>, <main>, <section>, <article>, <footer>)',
      'Form controls, input types, regex validation patterns, and label associations',
      'ARIA attributes (roles, aria-expanded, aria-hidden)',
      'Meta viewport tags and OpenGraph document metadata'
    ],
    whatToPractice: [
      'Audit an existing web page using browser accessibility dev tools and Lighthouse',
      'Build a multi-section registration form with client-side pattern validation'
    ],
    deliverable: 'W3C-compliant semantic multi-page website template featuring accessible forms and keyboard navigation.',
    completionCriteria: 'HTML validates with 0 errors on the official W3C validator and achieves a 95+ score on Google Lighthouse Accessibility.',
    estimatedEffort: '8 - 10 hours',
    durationDays: 7,
    priority: 'Medium',
    learningResources: [
      { title: 'MDN HTML Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { title: 'W3C Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' }
    ]
  },
  'css': {
    title: 'Modern CSS3 Layouts, Flexbox, Grid & Responsive Design',
    description: 'Master flexible component layouts, CSS Grid systems, custom properties (CSS variables), and mobile-first media queries.',
    phase: 'Phase 1 — Foundation',
    whyItMatters: 'Clean CSS is what transforms raw HTML into attractive, responsive interfaces that delight users across desktop, tablet, and mobile devices.',
    whatToLearn: [
      'Flexbox alignment properties (justify-content, align-items, flex-wrap)',
      'CSS Grid layout definition (grid-template-columns, gap, minmax)',
      'CSS custom variables and scalable design token systems',
      'Mobile-first media queries and viewport scaling',
      'CSS Transitions, transforms, and keyframe animations'
    ],
    whatToPractice: [
      'Build a responsive 12-column card layout that collapses cleanly to 1 column on mobile',
      'Implement an adaptive dark-mode color scheme using pure CSS custom variables'
    ],
    deliverable: 'Fully responsive personal portfolio layout that seamlessly adapts to desktop, iPad, and smartphone viewports.',
    completionCriteria: 'Layout displays with 0 horizontal scrollbar issues across 320px to 1920px screen widths.',
    estimatedEffort: '10 - 14 hours',
    durationDays: 10,
    priority: 'Medium',
    learningResources: [
      { title: 'MDN CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { title: 'CSS-Tricks Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }
    ]
  },
  'css3': {
    title: 'Modern CSS3 Layouts, Flexbox, Grid & Responsive Design',
    description: 'Master flexible component layouts, CSS Grid systems, custom properties (CSS variables), and mobile-first media queries.',
    phase: 'Phase 1 — Foundation',
    whyItMatters: 'Clean CSS transforms raw HTML into attractive, responsive interfaces that delight users across desktop, tablet, and mobile devices.',
    whatToLearn: [
      'Flexbox alignment properties (justify-content, align-items, flex-wrap)',
      'CSS Grid layout definition (grid-template-columns, gap, minmax)',
      'CSS custom variables and scalable design token systems',
      'Mobile-first media queries and viewport scaling',
      'CSS Transitions, transforms, and keyframe animations'
    ],
    whatToPractice: [
      'Build a responsive 12-column card layout that collapses cleanly to 1 column on mobile',
      'Implement an adaptive dark-mode color scheme using pure CSS custom variables'
    ],
    deliverable: 'Fully responsive personal portfolio layout that seamlessly adapts to desktop, iPad, and smartphone viewports.',
    completionCriteria: 'Layout displays with 0 horizontal scrollbar issues across 320px to 1920px screen widths.',
    estimatedEffort: '10 - 14 hours',
    durationDays: 10,
    priority: 'Medium',
    learningResources: [
      { title: 'MDN CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
      { title: 'CSS-Tricks Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }
    ]
  },
  'bootstrap': {
    title: 'Bootstrap 5 Rapid Prototyping & Component Systems',
    description: 'Learn rapid prototyping using Bootstrap 5 utility classes, responsive grid breakpoints, and interactive modals, navbars, and toasts.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Bootstrap allows frontend developers to rapidly deliver production-ready, accessible, and responsive user interfaces with consistent design tokens.',
    whatToLearn: [
      'Bootstrap 5 12-column grid and breakpoint suffixes (sm, md, lg, xl, xxl)',
      'Utility-first styling for spacing, typography, flexbox, and colors',
      'Interactive components: Modals, Toasts, Dropdowns, and Offcanvas drawers',
      'Customizing default theme colors using CSS variable overrides'
    ],
    whatToPractice: [
      'Convert a wireframe design into an interactive multi-column portal page using Bootstrap 5',
      'Trigger dynamic toast notifications and modals upon form submissions'
    ],
    deliverable: 'Enterprise Admin Dashboard interface built with Bootstrap 5 cards, tables, and modal dialogues.',
    completionCriteria: 'All interactive dialogs open and close smoothly, with complete keyboard accessibility.',
    estimatedEffort: '6 - 8 hours',
    durationDays: 5,
    priority: 'Low',
    learningResources: [
      { title: 'Bootstrap 5 Official Documentation', url: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/' }
    ]
  },
  'react': {
    title: 'React Component Hierarchy, State Management & Hooks',
    description: 'Build single-page web applications using React functional components, hooks (useState, useEffect, useMemo), and unidirectional data flow.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'React is the world’s leading frontend library for building highly interactive, scalable web client applications with reusable component hierarchies.',
    whatToLearn: [
      'JSX syntax, props passing, and component composability',
      'State management with useState and complex state with useReducer',
      'Side effect handling and API data fetching with useEffect',
      'Component lifecycle, memoization, and custom hooks'
    ],
    whatToPractice: [
      'Build a search filter interface where typing dynamically updates a component list without page reload',
      'Create a shared context provider for application theme or user session'
    ],
    deliverable: 'Interactive React Single-Page Application with live client-side routing, filtering, and API consumption.',
    completionCriteria: 'React components render without infinite re-render loops and adhere strictly to hooks rules of execution.',
    estimatedEffort: '18 - 24 hours',
    durationDays: 14,
    priority: 'High',
    learningResources: [
      { title: 'React Official Documentation (react.dev)', url: 'https://react.dev' }
    ]
  },
  'node.js': {
    title: 'Node.js Core Architecture & Asynchronous Backend Engineering',
    description: 'Understand the Node.js runtime, event loop, file system streams, buffer handling, and building scalable server-side microservices.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Node.js enables developers to run JavaScript on the server, building high-throughput, non-blocking I/O network applications and microservices.',
    whatToLearn: [
      'V8 JavaScript engine and libuv event loop architecture',
      'CommonJS vs ES Modules packaging standards',
      'Node.js core modules: fs, path, http, and events',
      'Buffer handling, streams, and process environment variables (.env)'
    ],
    whatToPractice: [
      'Write a CLI script that reads, parses, and transforms CSV or JSON data files asynchronously',
      'Create a standalone HTTP server handling GET and POST requests without third-party frameworks'
    ],
    deliverable: 'Modular Node.js background automation service with structured logging and error handling.',
    completionCriteria: 'Script processes asynchronous tasks cleanly without blocking the main event thread.',
    estimatedEffort: '14 - 18 hours',
    durationDays: 12,
    priority: 'High',
    learningResources: [
      { title: 'Node.js Official Documentation', url: 'https://nodejs.org/docs/latest/api/' },
      { title: 'Node.js Event Loop Guide', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' }
    ]
  },
  'express': {
    title: 'Express.js RESTful API Architecture, Middleware & Security',
    description: 'Architect scalable Express REST backends, configure middleware chains, implement input validation, and secure session/JWT authentication.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Express is the de facto standard backend web framework for Node.js, powering REST APIs and microservice architectures across the global software industry.',
    whatToLearn: [
      'Express app initialization, router modularization, and route parameters',
      'Custom middleware creation (logging, authentication guards, error handlers)',
      'Request body parsing, URL encoding, and cookie handling',
      'Input validation, sanitization, and HTTP response status code standards'
    ],
    whatToPractice: [
      'Implement an authenticated REST API with protect and role-based authorization middleware',
      'Write a global centralized error handling middleware that captures async rejections'
    ],
    deliverable: 'Full CRUD REST API supporting JWT authentication, protected endpoints, and structured JSON responses.',
    completionCriteria: 'API endpoints return correct HTTP status codes (200, 201, 400, 401, 403, 404, 500) and pass Postman automated tests.',
    estimatedEffort: '12 - 16 hours',
    durationDays: 12,
    priority: 'High',
    learningResources: [
      { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html' }
    ]
  },
  'express.js': {
    title: 'Express.js RESTful API Architecture, Middleware & Security',
    description: 'Architect scalable Express REST backends, configure middleware chains, implement input validation, and secure session/JWT authentication.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Express is the de facto standard backend web framework for Node.js, powering REST APIs and microservice architectures.',
    whatToLearn: [
      'Express app initialization, router modularization, and route parameters',
      'Custom middleware creation (logging, authentication guards, error handlers)',
      'Request body parsing, URL encoding, and cookie handling',
      'Input validation, sanitization, and HTTP response status code standards'
    ],
    whatToPractice: [
      'Implement an authenticated REST API with protect and role-based authorization middleware',
      'Write a global centralized error handling middleware that captures async rejections'
    ],
    deliverable: 'Full CRUD REST API supporting JWT authentication, protected endpoints, and structured JSON responses.',
    completionCriteria: 'API endpoints return correct HTTP status codes and pass Postman automated tests.',
    estimatedEffort: '12 - 16 hours',
    durationDays: 12,
    priority: 'High',
    learningResources: [
      { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html' }
    ]
  },
  'mongodb': {
    title: 'MongoDB Document Modeling, Mongoose Schemas & Aggregations',
    description: 'Model scalable documents using Mongoose, implement schema validation rules, optimize query indexes, and run aggregation pipelines.',
    phase: 'Phase 3 — Practical Projects',
    whyItMatters: 'MongoDB is the premier NoSQL database for modern web engineering, offering flexible document modeling, high scalability, and seamless integration with Node.js.',
    whatToLearn: [
      'Document database concepts vs relational tables',
      'Mongoose schema definitions, field validators, and timestamps',
      'Compound indexes, unique constraints, and query execution plans',
      'Mongoose middleware (pre-save, post-save hooks) and model methods',
      'MongoDB Aggregation framework ($match, $group, $lookup, $sort)'
    ],
    whatToPractice: [
      'Design a normalized multi-collection schema with relational ObjectId references',
      'Construct a compound unique index to strictly eliminate duplicate records for a student'
    ],
    deliverable: 'Comprehensive database integration layer performing end-to-end CRUD and analytical aggregation reports.',
    completionCriteria: 'All schema constraints prevent invalid data insertion, and queries execute efficiently with proper indexing.',
    estimatedEffort: '14 - 18 hours',
    durationDays: 12,
    priority: 'High',
    learningResources: [
      { title: 'MongoDB Official Documentation', url: 'https://www.mongodb.com/docs/' },
      { title: 'Mongoose Documentation', url: 'https://mongoosejs.com/docs/guide.html' }
    ]
  },
  'sql': {
    title: 'Relational Database Design, Normalization & Complex SQL Queries',
    description: 'Write advanced SELECT queries, multi-table joins, subqueries, indexing, and transactional integrity (ACID) across relational databases.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'SQL is the universal language for extracting, filtering, and joining structured enterprise data across PostgreSQL, MySQL, and cloud data warehouses.',
    whatToLearn: [
      'Relational schema design and Database Normalization (1NF, 2NF, 3NF)',
      'Multi-table joins: INNER, LEFT, RIGHT, and FULL OUTER joins',
      'Aggregation functions (SUM, AVG, COUNT) and GROUP BY / HAVING clauses',
      'Subqueries, Common Table Expressions (WITH clauses), and Window Functions',
      'ACID transactions (BEGIN, COMMIT, ROLLBACK)'
    ],
    whatToPractice: [
      'Write complex analytical SQL queries joining 3+ tables with filtering and aggregation',
      'Benchmark query performance before and after applying B-Tree indexes'
    ],
    deliverable: 'Complete relational database schema and set of 10 analytical reporting queries for an enterprise domain.',
    completionCriteria: 'Queries return expected dataset outputs with 0 syntax or Cartesian product errors.',
    estimatedEffort: '14 - 20 hours',
    durationDays: 14,
    priority: 'High',
    learningResources: [
      { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/' },
      { title: 'SQLBolt Interactive SQL Lessons', url: 'https://sqlbolt.com' }
    ]
  },
  'git': {
    title: 'Git Version Control, Branching Strategies & GitHub Collaboration',
    description: 'Master branch management, pull requests, merge conflict resolution, commit hygiene, and collaborative team workflows.',
    phase: 'Phase 1 — Foundation',
    whyItMatters: 'Professional software engineering teams rely on Git for code versioning, peer code review, continuous integration, and seamless teamwork.',
    whatToLearn: [
      'Git repository lifecycle: git init, add, commit, push, pull, clone',
      'Branching models: feature branching, git-flow, and pull request workflows',
      'Inspecting project history: git log, diff, and blame',
      'Resolving merge conflicts and understanding git stash / cherry-pick'
    ],
    whatToPractice: [
      'Create a feature branch, make incremental atomic commits, and open a GitHub Pull Request',
      'Simulate and successfully resolve a merge conflict between two branches'
    ],
    deliverable: 'Published GitHub repository featuring a descriptive README, clean commit history, and active branches.',
    completionCriteria: 'Repository contains atomic commits with conventional commit messages and 0 unresolved conflict markers.',
    estimatedEffort: '6 - 8 hours',
    durationDays: 7,
    priority: 'Medium',
    learningResources: [
      { title: 'Official Pro Git Book', url: 'https://git-scm.com/book/en/v2' },
      { title: 'GitHub Skills Tutorials', url: 'https://skills.github.com' }
    ]
  },
  'python': {
    title: 'Python for Software Engineering, Automation & Data Manipulation',
    description: 'Learn core Python syntax, object-oriented concepts, virtual environments, and data analysis pipelines using NumPy and Pandas.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Python is a powerhouse language renowned for clean readability, enterprise backend automation, machine learning, and data analytics.',
    whatToLearn: [
      'Python data types, list comprehensions, dictionaries, and tuple unpacking',
      'Functions, generator expressions, and lambda functions',
      'Object-Oriented Programming (classes, inheritance, dunder methods)',
      'Data manipulation using Pandas DataFrames and NumPy arrays'
    ],
    whatToPractice: [
      'Write a Python automation script that parses a directory of text/CSV files and generates summary statistics',
      'Build a small data cleaning pipeline that cleans missing values and creates grouped metrics'
    ],
    deliverable: 'Executable Python analytical script generating structured reports and visual charts.',
    completionCriteria: 'Script executes cleanly with proper exception handling and follows PEP 8 style standards.',
    estimatedEffort: '14 - 18 hours',
    durationDays: 14,
    priority: 'High',
    learningResources: [
      { title: 'Python Official Documentation', url: 'https://docs.python.org/3/tutorial/' },
      { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }
    ]
  },
  'data structures': {
    title: 'Core Data Structures & Algorithmic Problem Solving',
    description: 'Implement and analyze foundational data structures (Arrays, Linked Lists, Stacks, Queues, Trees, Hash Maps) and time/space complexity.',
    phase: 'Phase 4 — Advanced Practice',
    whyItMatters: 'Understanding data structures and algorithmic complexity is the cornerstone of technical interviews, scalable code design, and computational efficiency.',
    whatToLearn: [
      'Big-O asymptotic notation for time and space complexity',
      'Linear data structures: Dynamic Arrays, Linked Lists, Stacks, and Queues',
      'Non-linear data structures: Binary Search Trees, Heaps, and Hash Tables',
      'Core algorithms: Binary Search, QuickSort, MergeSort, BFS, and DFS'
    ],
    whatToPractice: [
      'Implement a Stack and Queue from scratch using linked nodes',
      'Solve 15 foundational coding interview problems on LeetCode/HackerRank'
    ],
    deliverable: 'Documented repository of custom data structure implementations with Big-O complexity notes.',
    completionCriteria: 'All data structures pass comprehensive unit test testcases covering edge cases (empty lists, single elements).',
    estimatedEffort: '20 - 30 hours',
    durationDays: 21,
    priority: 'High',
    learningResources: [
      { title: 'GeeksforGeeks Data Structures Guide', url: 'https://www.geeksforgeeks.org/data-structures/' }
    ]
  },
  'figma': {
    title: 'Figma UI/UX Design, Auto-Layout & Interactive Prototyping',
    description: 'Create responsive UI screens using Figma auto-layout, design tokens, component variants, and interactive micro-interactions.',
    phase: 'Phase 2 — Core Technical Skills',
    whyItMatters: 'Figma is the industry standard tool for UI/UX designers, enabling wireframing, high-fidelity mockups, design systems, and developer handoff.',
    whatToLearn: [
      'Auto-layout frames, constraints, and responsive container resizing',
      'Component creation, variants, and component property bindings',
      'Design token typography styles, color palettes, and grid layouts',
      'Interactive prototyping with smart animate and screen transitions'
    ],
    whatToPractice: [
      'Design a high-fidelity mobile and desktop web application interface in Figma',
      'Create an interactive clickable prototype connecting 5 key user workflow screens'
    ],
    deliverable: 'Figma Community prototype link featuring a cohesive design system and responsive application screens.',
    completionCriteria: 'Prototype functions interactively with active hover states, seamless navigation, and WCAG-compliant color contrast.',
    estimatedEffort: '12 - 16 hours',
    durationDays: 14,
    priority: 'High',
    learningResources: [
      { title: 'Figma Official Help Center & Tutorials', url: 'https://help.figma.com' }
    ]
  }
};

/**
 * Generates an enriched roadmap task based on the student's skill gap.
 */
function getRecommendationForSkill(skillName, careerTitle, gapType, requiredProficiency, currentProficiency) {
  const normalized = (skillName || '').trim().toLowerCase();
  
  // Find match or partial match in curated library
  let template = skillRecommendations[normalized];
  if (!template) {
    const key = Object.keys(skillRecommendations).find(k => normalized.includes(k) || k.includes(normalized));
    if (key) template = skillRecommendations[key];
  }

  if (!template) {
    template = {
      title: `Advance ${skillName} Proficiency for ${careerTitle}`,
      description: `Complete targeted exercises, build mini-projects, and read standard technical documentation for ${skillName}.`,
      phase: gapType === 'Missing' ? 'Phase 1 — Foundation' : 'Phase 2 — Core Technical Skills',
      whyItMatters: `Mastery of ${skillName} is a recognized industry requirement for candidates seeking ${careerTitle} roles.`,
      whatToLearn: [
        `${skillName} fundamental syntax, concepts, and architectural principles`,
        `Standard industry design patterns and community best practices for ${skillName}`,
        `Testing, debugging, and production error handling in ${skillName}`
      ],
      whatToPractice: [
        `Complete practical exercises applying ${skillName} in isolated examples`,
        `Build a mini-application demonstrating ${skillName} integrated with other project technologies`
      ],
      deliverable: `Working project deliverable showcasing practical competence in ${skillName}.`,
      completionCriteria: `Project operates without errors and demonstrates verified proficiency at the target level.`,
      estimatedEffort: '10 - 14 hours',
      priority: gapType === 'Missing' ? 'High' : 'Medium',
      durationDays: 10,
      learningResources: [
        { title: `${skillName} Official Documentation`, url: 'https://developer.mozilla.org' }
      ]
    };
  }

  const reason = gapType === 'Missing'
    ? `Required for ${careerTitle} at ${requiredProficiency} level, but not yet added to your skill inventory.`
    : `Your current proficiency is ${currentProficiency}, but ${careerTitle} requires ${requiredProficiency} proficiency.`;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (template.durationDays || 10));

  return {
    title: template.title,
    description: template.description,
    reason: reason,
    priority: gapType === 'Missing' ? 'High' : (template.priority || 'Medium'),
    phase: template.phase || (gapType === 'Missing' ? 'Phase 1 — Foundation' : 'Phase 2 — Core Technical Skills'),
    whyItMatters: template.whyItMatters,
    whatToLearn: template.whatToLearn,
    whatToPractice: template.whatToPractice,
    deliverable: template.deliverable,
    completionCriteria: template.completionCriteria,
    estimatedEffort: template.estimatedEffort || '10 - 15 hours',
    learningResources: template.learningResources || [],
    targetDate: targetDate,
    sourceSkill: skillName
  };
}

module.exports = {
  skillRecommendations,
  getRecommendationForSkill
};
