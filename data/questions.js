/**
 * Practice Assessment Questions Module
 * Trusted server-side repository for multiple-choice practice quiz questions.
 * Correct answers and explanations remain on the server and are only returned
 * after quiz submission.
 */

const topics = [
  {
    id: 'html',
    name: 'HTML',
    displayName: 'HTML & Semantic Markup',
    skillCategory: 'Frontend',
    icon: 'bi-filetype-html',
    badgeColor: '#059669',
    description: 'Test your understanding of semantic HTML5 tags, document structure, forms, and web accessibility attributes.',
    questionCount: 5,
    estimatedMinutes: 5
  },
  {
    id: 'css',
    name: 'CSS',
    displayName: 'CSS3 & Responsive Styling',
    skillCategory: 'Frontend',
    icon: 'bi-filetype-css',
    badgeColor: '#0D9488',
    description: 'Evaluate your knowledge of the CSS box model, Flexbox, Grid, selectors, specificity, and responsive design.',
    questionCount: 5,
    estimatedMinutes: 5
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    displayName: 'JavaScript & Modern ES6+',
    skillCategory: 'Frontend',
    icon: 'bi-filetype-js',
    badgeColor: '#F59E0B',
    description: 'Assess core JavaScript concepts including data types, closures, array methods, DOM interaction, and async/promises.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'sql',
    name: 'SQL',
    displayName: 'SQL & Relational Databases',
    skillCategory: 'Database',
    icon: 'bi-database',
    badgeColor: '#10B981',
    description: 'Verify your proficiency with SQL queries, table joins, aggregation functions, filtering, and database normalization.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    displayName: 'Programming & CS Fundamentals',
    skillCategory: 'Core CS',
    icon: 'bi-gear-wide-connected',
    badgeColor: '#8B5CF6',
    description: 'Test fundamental concepts of algorithms, data structures, Big-O notation, control flow, and clean code.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'python',
    name: 'Python',
    displayName: 'Python Programming & Data Structures',
    skillCategory: 'Programming',
    icon: 'bi-filetype-py',
    badgeColor: '#3B82F6',
    description: 'Practice fundamental Python concepts including data types, list comprehensions, dictionary operations, and OOP.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'react',
    name: 'React',
    displayName: 'React & Component Architecture',
    skillCategory: 'Frontend',
    icon: 'bi-layers',
    badgeColor: '#06B6D4',
    description: 'Evaluate your understanding of React functional components, hooks (useState, useEffect), props, and virtual DOM.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    displayName: 'Node.js & Express Backend',
    skillCategory: 'Backend',
    icon: 'bi-server',
    badgeColor: '#16A34A',
    description: 'Assess your knowledge of Node.js event-driven architecture, Express middleware, routing, and RESTful API design.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    displayName: 'MongoDB & Document Databases',
    skillCategory: 'Database',
    icon: 'bi-hdd-network',
    badgeColor: '#047857',
    description: 'Verify your skills in NoSQL document design, Mongoose schemas, CRUD queries, and aggregation pipelines.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'git',
    name: 'Git',
    displayName: 'Git & Version Control',
    skillCategory: 'Tools and Platforms',
    icon: 'bi-git',
    badgeColor: '#F97316',
    description: 'Test practical Git commands, branching, merging, remote repositories, and collaborative commit workflows.',
    questionCount: 5,
    estimatedMinutes: 5
  },
  {
    id: 'java',
    name: 'Java',
    displayName: 'Java Programming & OOP',
    skillCategory: 'Programming',
    icon: 'bi-filetype-java',
    badgeColor: '#EA580C',
    description: 'Practice Java object-oriented concepts, class inheritance, interfaces, collections framework, and exception handling.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'cpp',
    name: 'C++',
    displayName: 'C++ & Systems Programming',
    skillCategory: 'Programming',
    icon: 'bi-code-square',
    badgeColor: '#6366F1',
    description: 'Evaluate your understanding of C++ memory management, pointers, references, classes, and standard template library (STL).',
    questionCount: 5,
    estimatedMinutes: 6
  }
];

const questions = [
  // ==================== HTML QUESTIONS ====================
  {
    id: 'html_1',
    topicId: 'html',
    topicName: 'HTML',
    concept: 'Semantic Layout',
    question: 'Which HTML5 element should be used to wrap autonomous, self-contained content intended for independent distribution or syndication (such as a blog post)?',
    options: ['<section>', '<article>', '<div>', '<aside>'],
    correctIndex: 1,
    explanation: 'The <article> element represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable.'
  },
  {
    id: 'html_2',
    topicId: 'html',
    topicName: 'HTML',
    concept: 'Image Accessibility',
    question: 'What is the primary accessibility purpose of the "alt" attribute on an <img> tag?',
    options: [
      'To display a tooltip when a user hovers over the image',
      'To provide text alternative for screen readers and when images fail to load',
      'To define the image file type for the browser rendering engine',
      'To increase SEO ranking by repeating keyword tags'
    ],
    correctIndex: 1,
    explanation: 'The "alt" attribute specifies an alternate text for an area, which is vital for screen reader users and displays when the image cannot be downloaded.'
  },
  {
    id: 'html_3',
    topicId: 'html',
    topicName: 'HTML',
    concept: 'Form Controls',
    question: 'In an HTML form, which input attribute is used to group related radio buttons so that only one can be selected at a time?',
    options: ['id', 'class', 'name', 'value'],
    correctIndex: 2,
    explanation: 'Radio buttons with identical "name" attributes belong to the same mutual exclusion group; only one in the group can be checked at any given time.'
  },
  {
    id: 'html_4',
    topicId: 'html',
    topicName: 'HTML',
    concept: 'HTML5 Standards',
    question: 'Which of the following is NOT a semantic HTML5 tag?',
    options: ['<nav>', '<header>', '<center>', '<main>'],
    correctIndex: 2,
    explanation: '<center> is a deprecated presentational HTML4 tag removed in HTML5. Modern web standards require CSS for centering and semantic tags for layout.'
  },
  {
    id: 'html_5',
    topicId: 'html',
    topicName: 'HTML',
    concept: 'Document Type Declaration',
    question: 'What is the correct DOCTYPE declaration for standard HTML5 documents?',
    options: [
      '<!DOCTYPE html>',
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">',
      '<DOCTYPE html5>',
      '<html doctype="5">'
    ],
    correctIndex: 0,
    explanation: '<!DOCTYPE html> is the concise, case-insensitive doctype required by HTML5 to enable standards-compliant rendering mode in browsers.'
  },

  // ==================== CSS QUESTIONS ====================
  {
    id: 'css_1',
    topicId: 'css',
    topicName: 'CSS',
    concept: 'Box Model',
    question: 'In the standard CSS box model, which layer sits immediately between the content area and the border?',
    options: ['Margin', 'Padding', 'Outline', 'Border-radius'],
    correctIndex: 1,
    explanation: 'From inside to outside, the CSS box model consists of: Content -> Padding -> Border -> Margin.'
  },
  {
    id: 'css_2',
    topicId: 'css',
    topicName: 'CSS',
    concept: 'Flexbox Alignment',
    question: 'When using CSS Flexbox on a container, which property aligns flex items along the cross-axis?',
    options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
    correctIndex: 1,
    explanation: '"justify-content" controls alignment along the main axis, while "align-items" controls alignment along the cross axis.'
  },
  {
    id: 'css_3',
    topicId: 'css',
    topicName: 'CSS',
    concept: 'Specificity Rules',
    question: 'Which CSS selector has the highest specificity according to CSS precedence rules?',
    options: [
      'An ID selector (e.g. #header)',
      'A class selector (e.g. .btn-primary)',
      'An element selector (e.g. div)',
      'A universal selector (e.g. *)'
    ],
    correctIndex: 0,
    explanation: 'ID selectors contribute (0, 1, 0, 0) specificity, which outweighs any number of classes (0, 0, 1, 0) or element tags (0, 0, 0, 1).'
  },
  {
    id: 'css_4',
    topicId: 'css',
    topicName: 'CSS',
    concept: 'Box Sizing',
    question: 'What does the CSS property "box-sizing: border-box" achieve?',
    options: [
      'It adds a shadow inside the border',
      'It causes padding and border widths to be included within the element\'s specified total width and height',
      'It removes default borders from all input fields',
      'It doubles the margin around the element'
    ],
    correctIndex: 1,
    explanation: 'With "border-box", an element\'s declared width and height include padding and border, making responsive layouts much easier to calculate and maintain.'
  },
  {
    id: 'css_5',
    topicId: 'css',
    topicName: 'CSS',
    concept: 'Responsive Media Queries',
    question: 'Which CSS media query correctly targets viewport widths of 768 pixels or wider?',
    options: [
      '@media (max-width: 768px)',
      '@media (min-width: 768px)',
      '@media screen and (width == 768px)',
      '@media only (device-width: 768px)'
    ],
    correctIndex: 1,
    explanation: '"@media (min-width: 768px)" applies styles when the viewport is at least 768px wide, following the standard mobile-first responsive design pattern.'
  },

  // ==================== JAVASCRIPT QUESTIONS ====================
  {
    id: 'js_1',
    topicId: 'javascript',
    topicName: 'JavaScript',
    concept: 'Type Coercion & Data Types',
    question: 'What is the output of `typeof null` in standard JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2,
    explanation: '`typeof null` evaluates to "object" due to a historical legacy bug in the original 1995 JavaScript implementation that has been preserved for backward compatibility.'
  },
  {
    id: 'js_2',
    topicId: 'javascript',
    topicName: 'JavaScript',
    concept: 'Array Higher-Order Methods',
    question: 'Which array method creates a new array populated with the results of calling a provided function on every element in the calling array?',
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    correctIndex: 1,
    explanation: 'Array.prototype.map() returns a brand new array with transformed elements without mutating the original array.'
  },
  {
    id: 'js_3',
    topicId: 'javascript',
    topicName: 'JavaScript',
    concept: 'Closures & Lexical Scope',
    question: 'What is a closure in JavaScript?',
    options: [
      'A method used to close database connections',
      'A function bundled together with references to its surrounding lexical environment',
      'An event listener that only fires once and then removes itself',
      'A syntax error caused by unmatched curly braces'
    ],
    correctIndex: 1,
    explanation: 'A closure is the combination of a function and the lexical environment within which that function was declared, allowing inner functions to access outer scope variables even after the outer function has returned.'
  },
  {
    id: 'js_4',
    topicId: 'javascript',
    topicName: 'JavaScript',
    concept: 'Equality Operators',
    question: 'What is the main difference between "==" and "===" in JavaScript?',
    options: [
      '"==" compares memory addresses while "===" compares values',
      '"==" performs type coercion before comparison; "===" checks both value and type strictly',
      '"===" is used exclusively in TypeScript',
      'There is no difference; they are interchangeable'
    ],
    correctIndex: 1,
    explanation: 'The strict equality operator "===" does not perform type coercion, returning true only if both operands have the identical type and equal value.'
  },
  {
    id: 'js_5',
    topicId: 'javascript',
    topicName: 'JavaScript',
    concept: 'Async / Await Error Handling',
    question: 'How do you handle rejected Promises when using `async / await` syntax?',
    options: [
      'Using a `try...catch` block',
      'Using the `defer` keyword',
      'By throwing a synchronous callback',
      'Promises cannot fail when awaited'
    ],
    correctIndex: 0,
    explanation: 'In async functions, rejected promises throw exceptions that can be caught using standard `try...catch` blocks.'
  },

  // ==================== SQL QUESTIONS ====================
  {
    id: 'sql_1',
    topicId: 'sql',
    topicName: 'SQL',
    concept: 'Group Filtering (HAVING)',
    question: 'Which SQL clause is used to filter group records generated by a GROUP BY statement?',
    options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
    correctIndex: 1,
    explanation: 'The WHERE clause filters individual rows before grouping, while the HAVING clause filters aggregated groups after the GROUP BY operation has occurred.'
  },
  {
    id: 'sql_2',
    topicId: 'sql',
    topicName: 'SQL',
    concept: 'Join Operations',
    question: 'Which type of JOIN returns all records from the left table, and matching records from the right table (filling with NULLs when there is no match)?',
    options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
    correctIndex: 2,
    explanation: 'A LEFT JOIN (or LEFT OUTER JOIN) preserves every row from the left table regardless of whether a matching record exists on the right.'
  },
  {
    id: 'sql_3',
    topicId: 'sql',
    topicName: 'SQL',
    concept: 'DDL & Table Removal',
    question: 'What does the SQL command `DROP TABLE users;` do?',
    options: [
      'Deletes all rows inside `users` but preserves the table structure',
      'Deletes the entire table structure along with all its data permanently',
      'Creates a backup copy of the table',
      'Disables modifications to the table temporarily'
    ],
    correctIndex: 1,
    explanation: '`DROP TABLE` permanently removes the entire table definition along with all indexes, triggers, and data. (To delete only data while preserving schema, TRUNCATE or DELETE is used).'
  },
  {
    id: 'sql_4',
    topicId: 'sql',
    topicName: 'SQL',
    concept: 'Primary Key Constraints',
    question: 'What is a Primary Key in relational databases?',
    options: [
      'Any column that contains numerical values',
      'A column or set of columns that uniquely identifies each row in a table and cannot contain NULL values',
      'A password used to access the database management system',
      'The first column created when defining a table'
    ],
    correctIndex: 1,
    explanation: 'A primary key enforces entity integrity: every row must have a unique non-null identifier.'
  },
  {
    id: 'sql_5',
    topicId: 'sql',
    topicName: 'SQL',
    concept: 'Aggregate Functions',
    question: 'Which aggregate function counts the total number of non-null values in a specified column?',
    options: ['TOTAL()', 'SUM()', 'COUNT()', 'ROWS()'],
    correctIndex: 2,
    explanation: '`COUNT(column_name)` returns the number of non-null rows in that column, whereas `COUNT(*)` counts total rows including nulls.'
  },

  // ==================== PROGRAMMING FUNDAMENTALS QUESTIONS ====================
  {
    id: 'prog_1',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    concept: 'Binary Search Trees & Complexity',
    question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'In a balanced binary search tree, each comparison cuts the search space in half, yielding O(log n) average time complexity.'
  },
  {
    id: 'prog_2',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    concept: 'Stack Data Structure',
    question: 'Which data structure operates on a Last-In, First-Out (LIFO) basis?',
    options: ['Queue', 'Stack', 'Linked List', 'Array'],
    correctIndex: 1,
    explanation: 'A Stack follows the LIFO principle, where elements are added (pushed) and removed (popped) from the top.'
  },
  {
    id: 'prog_3',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    concept: 'OOP Encapsulation',
    question: 'In Object-Oriented Programming (OOP), what is "Encapsulation"?',
    options: [
      'The ability of different objects to respond to the same method call in different ways',
      'Bundling data and methods that operate on that data into a single unit and restricting direct access to internal components',
      'Deriving new classes from existing parent classes',
      'Converting source code into machine code'
    ],
    correctIndex: 1,
    explanation: 'Encapsulation bundles data and behaviors into classes and protects an object\'s internal state by requiring interaction via public methods.'
  },
  {
    id: 'prog_4',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    concept: 'Recursion Base Cases',
    question: 'What is a "base case" in a recursive algorithm?',
    options: [
      'The worst-case Big-O runtime scenario',
      'The terminating condition that stops recursion from continuing infinitely',
      'The initial argument passed into the function on first invocation',
      'The memory space allocated on the heap'
    ],
    correctIndex: 1,
    explanation: 'Without a base case that returns a value without further recursive calls, recursion will continue until the call stack overflows.'
  },
  {
    id: 'prog_5',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    concept: 'Sorting Algorithms & Auxiliary Space',
    question: 'Which of the following is considered an in-place sorting algorithm with O(1) auxiliary space complexity?',
    options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Radix Sort'],
    correctIndex: 2,
    explanation: 'Bubble Sort modifies the array directly without allocating additional array structures, requiring O(1) auxiliary space.'
  },

  // ==================== PYTHON QUESTIONS ====================
  {
    id: 'py_1',
    topicId: 'python',
    topicName: 'Python',
    concept: 'Data Mutability',
    question: 'Which of the following data types in Python is immutable?',
    options: ['List', 'Dictionary', 'Tuple', 'Set'],
    correctIndex: 2,
    explanation: 'Tuples in Python cannot be modified after creation, making them immutable sequences unlike lists, sets, and dictionaries.'
  },
  {
    id: 'py_2',
    topicId: 'python',
    topicName: 'Python',
    concept: 'List Comprehensions',
    question: 'What will be the output of `[x * 2 for x in range(3)]` in Python?',
    options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[0, 2]'],
    correctIndex: 0,
    explanation: '`range(3)` produces numbers 0, 1, and 2. Multiplying each by 2 yields `[0, 2, 4]`.'
  },
  {
    id: 'py_3',
    topicId: 'python',
    topicName: 'Python',
    concept: 'Dictionary Access',
    question: 'What happens when accessing a non-existent key in a Python dictionary using square bracket syntax: `my_dict["missing_key"]`?',
    options: [
      'Returns `None` silently',
      'Raises a `KeyError` exception',
      'Creates the key with value `None`',
      'Returns boolean `False`'
    ],
    correctIndex: 1,
    explanation: 'Accessing a missing key via `[]` raises a KeyError. To avoid this, `my_dict.get("missing_key")` can be used to return None or a default value.'
  },
  {
    id: 'py_4',
    topicId: 'python',
    topicName: 'Python',
    concept: 'Object-Oriented Constructors',
    question: 'What is the purpose of the `__init__` method in Python classes?',
    options: [
      'To destroy object instances when out of scope',
      'To serve as the initializer/constructor when a new instance of the class is created',
      'To import external modules into class scope',
      'To convert the class into a string representation'
    ],
    correctIndex: 1,
    explanation: '`__init__` is the constructor method in Python automatically invoked whenever a new instance of a class is instantiated.'
  },
  {
    id: 'py_5',
    topicId: 'python',
    topicName: 'Python',
    concept: 'Virtual Environments',
    question: 'Why are Python virtual environments (e.g. using `venv`) used in software projects?',
    options: [
      'To emulate different operating systems on your PC',
      'To isolate project dependencies and prevent package version conflicts across projects',
      'To speed up CPU clock speed during program execution',
      'To compile Python code into standalone executable files'
    ],
    correctIndex: 1,
    explanation: 'Virtual environments keep project-specific dependencies and library versions isolated, avoiding conflicts between global packages.'
  },

  // ==================== REACT QUESTIONS ====================
  {
    id: 'react_1',
    topicId: 'react',
    topicName: 'React',
    concept: 'State Management (useState)',
    question: 'In a React functional component, which hook is used to declare and update local state variables?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctIndex: 1,
    explanation: '`useState` is the fundamental hook in React for adding local component state and receiving an updater function.'
  },
  {
    id: 'react_2',
    topicId: 'react',
    topicName: 'React',
    concept: 'Side Effects (useEffect)',
    question: 'When does a `useEffect` hook with an empty dependency array `[]` execute in React?',
    options: [
      'On every single component re-render',
      'Only once after the initial render (mount)',
      'Immediately before component unmounts only',
      'Whenever any prop changes'
    ],
    correctIndex: 1,
    explanation: 'An empty dependency array `[]` tells React that the effect doesn\'t depend on any reactive values, so it runs only once after the initial render.'
  },
  {
    id: 'react_3',
    topicId: 'react',
    topicName: 'React',
    concept: 'Props vs State',
    question: 'What is the primary difference between `props` and `state` in React components?',
    options: [
      'Props are internal and mutable; state is external and read-only',
      'Props are passed from parent to child (read-only); state is managed internally by the component',
      'Props only work in class components; state only works in functional components',
      'Props and state are identical concepts with different names'
    ],
    correctIndex: 1,
    explanation: 'Props are inputs passed down from parent components and are read-only, whereas state is local data managed and mutated within the component.'
  },
  {
    id: 'react_4',
    topicId: 'react',
    topicName: 'React',
    concept: 'List Rendering Keys',
    question: 'Why does React require a unique `key` prop when rendering lists of elements?',
    options: [
      'To apply CSS styles to individual list elements',
      'To help React identify which items have changed, been added, or been removed during reconciliation',
      'To sort the list items automatically alphabetically',
      'To encrypt list data for secure rendering'
    ],
    correctIndex: 1,
    explanation: 'Keys provide a stable identity for elements across renders, enabling React\'s virtual DOM diffing algorithm to efficiently update the real DOM.'
  },
  {
    id: 'react_5',
    topicId: 'react',
    topicName: 'React',
    concept: 'JSX Syntax Rules',
    question: 'In JSX, which attribute replaces the standard HTML "class" attribute to assign CSS classes?',
    options: ['class', 'className', 'cssClass', 'styleClass'],
    correctIndex: 1,
    explanation: 'Since "class" is a reserved keyword in JavaScript, JSX uses `className` to specify CSS classes for HTML elements.'
  },

  // ==================== NODE.JS & EXPRESS QUESTIONS ====================
  {
    id: 'node_1',
    topicId: 'nodejs',
    topicName: 'Node.js',
    concept: 'Architecture & Event Loop',
    question: 'What is the execution model of Node.js by default for handling I/O operations?',
    options: [
      'Multi-threaded blocking synchronous I/O',
      'Single-threaded event-driven non-blocking asynchronous I/O',
      'Forking a new OS process for each incoming HTTP request',
      'Compiled binary execution directly on hardware'
    ],
    correctIndex: 1,
    explanation: 'Node.js utilizes a single-threaded event loop combined with libuv worker threads to achieve high-throughput non-blocking asynchronous I/O.'
  },
  {
    id: 'node_2',
    topicId: 'nodejs',
    topicName: 'Node.js',
    concept: 'Express Middleware',
    question: 'In an Express.js route handler or middleware function, what is the role of the `next()` argument?',
    options: [
      'To terminate the current HTTP request immediately',
      'To pass control to the next middleware function in the request-response pipeline',
      'To redirect the browser to the next URL route',
      'To restart the Node.js server'
    ],
    correctIndex: 1,
    explanation: 'Calling `next()` passes execution control to the next middleware function in the Express pipeline; omitting it leaves the request hanging.'
  },
  {
    id: 'node_3',
    topicId: 'nodejs',
    topicName: 'Node.js',
    concept: 'Package Management',
    question: 'Which file in a Node.js project defines project dependencies, version constraints, and executable npm scripts?',
    options: ['package.json', 'node_modules.config', 'server.config.js', 'index.html'],
    correctIndex: 0,
    explanation: '`package.json` contains metadata, dependency lists, and script definitions required to manage and build a Node.js application.'
  },
  {
    id: 'node_4',
    topicId: 'nodejs',
    topicName: 'Node.js',
    concept: 'Environment Variables',
    question: 'In Node.js applications, how do you securely access system environment variables at runtime?',
    options: ['System.getEnv("VAR_NAME")', 'process.env.VAR_NAME', 'window.env.VAR_NAME', 'global.variables.VAR_NAME'],
    correctIndex: 1,
    explanation: 'The global `process.env` object provides access to user environment variables defined on the host operating system or via `.env` files.'
  },
  {
    id: 'node_5',
    topicId: 'nodejs',
    topicName: 'Node.js',
    concept: 'HTTP Status Codes',
    question: 'Which HTTP status code should be returned when a resource is successfully created via a POST endpoint?',
    options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
    correctIndex: 1,
    explanation: 'HTTP 201 Created signifies that the request has succeeded and resulted in the creation of one or more new resources on the server.'
  },

  // ==================== MONGODB QUESTIONS ====================
  {
    id: 'mongo_1',
    topicId: 'mongodb',
    topicName: 'MongoDB',
    concept: 'Document Data Model',
    question: 'In MongoDB, what data format is used to store documents internally?',
    options: ['XML', 'BSON (Binary JSON)', 'CSV', 'YAML'],
    correctIndex: 1,
    explanation: 'MongoDB stores data internally in BSON format, which extends JSON with data types like Date, ObjectId, and raw binary.'
  },
  {
    id: 'mongo_2',
    topicId: 'mongodb',
    topicName: 'MongoDB',
    concept: 'CRUD Queries',
    question: 'Which Mongoose method finds a single document matching a condition and updates it in a single operation?',
    options: ['findOneAndUpdate()', 'findAndChange()', 'updateOnly()', 'selectAndUpdate()'],
    correctIndex: 0,
    explanation: '`findOneAndUpdate(filter, update, options)` locates the first document matching filter criteria and applies atomic updates.'
  },
  {
    id: 'mongo_3',
    topicId: 'mongodb',
    topicName: 'MongoDB',
    concept: 'Primary Key (_id)',
    question: 'What is the default unique identifier field generated automatically for each MongoDB document?',
    options: ['id', '_id', 'uuid', 'doc_key'],
    correctIndex: 1,
    explanation: 'MongoDB automatically generates a 12-byte `_id` field with an ObjectId timestamp for every inserted document if not explicitly specified.'
  },
  {
    id: 'mongo_4',
    topicId: 'mongodb',
    topicName: 'MongoDB',
    concept: 'Indexing Performance',
    question: 'What is the primary benefit of creating indexes on frequently queried fields in MongoDB?',
    options: [
      'To encrypt the field values from unauthorized users',
      'To drastically speed up search and query execution by avoiding full collection scans',
      'To automatically back up the database every hour',
      'To prevent documents from being deleted'
    ],
    correctIndex: 1,
    explanation: 'Indexes order field values in efficient B-tree structures so the query engine does not have to scan every document in the collection.'
  },
  {
    id: 'mongo_5',
    topicId: 'mongodb',
    topicName: 'MongoDB',
    concept: 'Aggregation Pipelines',
    question: 'In a MongoDB aggregation pipeline, which operator is used to filter documents in a manner similar to a SQL WHERE clause?',
    options: ['$filter', '$match', '$where', '$find'],
    correctIndex: 1,
    explanation: '`$match` filters the document stream to allow only matching documents to pass through to the next pipeline stage.'
  },

  // ==================== GIT QUESTIONS ====================
  {
    id: 'git_1',
    topicId: 'git',
    topicName: 'Git',
    concept: 'Staging Area',
    question: 'Which Git command adds modified files to the staging area in preparation for a commit?',
    options: ['git push', 'git add', 'git stage-all', 'git save'],
    correctIndex: 1,
    explanation: '`git add <files>` updates the index using the current content of the working tree, staging changes for the next commit.'
  },
  {
    id: 'git_2',
    topicId: 'git',
    topicName: 'Git',
    concept: 'Branch Management',
    question: 'Which modern command creates and immediately switches to a new Git branch called `feature-login`?',
    options: ['git switch -c feature-login', 'git branch -new feature-login', 'git create feature-login', 'git goto feature-login'],
    correctIndex: 0,
    explanation: '`git switch -c <branch>` (or `git checkout -b <branch>`) creates the specified branch and checks it out in a single step.'
  },
  {
    id: 'git_3',
    topicId: 'git',
    topicName: 'Git',
    concept: 'Inspecting Changes',
    question: 'Which command shows unstaged differences between your working directory and the current staging index?',
    options: ['git status', 'git diff', 'git log', 'git show'],
    correctIndex: 1,
    explanation: '`git diff` displays the exact line-by-line differences between modified files in your working directory and the staging area.'
  },
  {
    id: 'git_4',
    topicId: 'git',
    topicName: 'Git',
    concept: 'Undoing Changes',
    question: 'What is the purpose of the `.gitignore` file in a Git project?',
    options: [
      'To list files that must be encrypted before pushing',
      'To specify untracked files and folders (like node_modules and .env) that Git should intentionally ignore',
      'To prevent developers from committing during weekends',
      'To track merge conflicts automatically'
    ],
    correctIndex: 1,
    explanation: 'The `.gitignore` file specifies intentionally untracked files and patterns that Git should ignore and exclude from version control.'
  },
  {
    id: 'git_5',
    topicId: 'git',
    topicName: 'Git',
    concept: 'Remote Synchronization',
    question: 'What is the difference between `git fetch` and `git pull`?',
    options: [
      '`git fetch` uploads local commits; `git pull` downloads remote commits',
      '`git fetch` downloads remote commits without merging them; `git pull` fetches and automatically merges into the current branch',
      '`git fetch` deletes remote branches; `git pull` creates new branches',
      'There is no difference; they are aliases for the same operation'
    ],
    correctIndex: 1,
    explanation: '`git fetch` updates remote tracking branches without touching your local working copy. `git pull` combines `git fetch` followed by `git merge`.'
  },

  // ==================== JAVA QUESTIONS ====================
  {
    id: 'java_1',
    topicId: 'java',
    topicName: 'Java',
    concept: 'Compilation & Platform Independence',
    question: 'What allows Java code to run on any computer architecture without recompilation ("Write Once, Run Anywhere")?',
    options: [
      'Java code compiles directly into binary x86 machine instructions',
      'Java code compiles into bytecode that executes on the Java Virtual Machine (JVM)',
      'The Java compiler bundles an operating system with every JAR file',
      'Java runs directly inside web browser rendering engines'
    ],
    correctIndex: 1,
    explanation: 'The Java compiler produces intermediate `.class` bytecode, which is interpreted or JIT-compiled at runtime by platform-specific JVM implementations.'
  },
  {
    id: 'java_2',
    topicId: 'java',
    topicName: 'Java',
    concept: 'Inheritance & Keywords',
    question: 'Which Java keyword is used by a child class to inherit from a parent superclass?',
    options: ['implements', 'extends', 'inherits', 'super'],
    correctIndex: 1,
    explanation: 'The `extends` keyword establishes inheritance between classes in Java (whereas `implements` is used for interfaces).'
  },
  {
    id: 'java_3',
    topicId: 'java',
    topicName: 'Java',
    concept: 'Memory & Garbage Collection',
    question: 'Where are Java object instances dynamically allocated in memory?',
    options: ['Stack memory', 'Heap memory', 'Program Counter register', 'Read-only code segment'],
    correctIndex: 1,
    explanation: 'In Java, all objects and class instances are allocated on the Heap memory, which is managed and cleaned by the Garbage Collector.'
  },
  {
    id: 'java_4',
    topicId: 'java',
    topicName: 'Java',
    concept: 'Access Modifiers',
    question: 'Which Java access modifier restricts access to variables and methods exclusively within the same class?',
    options: ['public', 'protected', 'default (package-private)', 'private'],
    correctIndex: 3,
    explanation: 'The `private` modifier provides the highest level of encapsulation: members are only accessible within the declaring class body.'
  },
  {
    id: 'java_5',
    topicId: 'java',
    topicName: 'Java',
    concept: 'Collections Framework',
    question: 'Which interface in the Java Collections Framework represents an unordered collection of elements that contains no duplicate values?',
    options: ['List', 'Queue', 'Set', 'Map'],
    correctIndex: 2,
    explanation: 'The `Set` interface (such as `HashSet` or `TreeSet`) models the mathematical set abstraction and prevents duplicate elements.'
  },

  // ==================== C++ QUESTIONS ====================
  {
    id: 'cpp_1',
    topicId: 'cpp',
    topicName: 'C++',
    concept: 'Pointers & Addresses',
    question: 'In C++, which operator is used to obtain the memory address of an existing variable?',
    options: ['*', '&', '->', '::'],
    correctIndex: 1,
    explanation: 'The address-of operator `&` returns the pointer address where a variable is stored in system memory.'
  },
  {
    id: 'cpp_2',
    topicId: 'cpp',
    topicName: 'C++',
    concept: 'Dynamic Memory Deallocation',
    question: 'When dynamic memory is allocated using the `new` operator in C++, which operator must be used to prevent memory leaks?',
    options: ['free()', 'delete', 'release', 'dispose'],
    correctIndex: 1,
    explanation: 'Memory allocated with `new` must be freed with `delete` (or `delete[]` for dynamic arrays) to deallocate heap memory.'
  },
  {
    id: 'cpp_3',
    topicId: 'cpp',
    topicName: 'C++',
    concept: 'Scope Resolution',
    question: 'What is the purpose of the scope resolution operator `::` in C++?',
    options: [
      'To access global variables or members defined inside specific namespaces and classes',
      'To perform bitwise shifting on integers',
      'To concatenate string objects',
      'To define single-line comments'
    ],
    correctIndex: 0,
    explanation: 'The `::` scope resolution operator qualifies names to specify their enclosing namespace or class scope (e.g. `std::cout` or `MyClass::myMethod`).'
  },
  {
    id: 'cpp_4',
    topicId: 'cpp',
    topicName: 'C++',
    concept: 'Polymorphism & Virtual Functions',
    question: 'Which C++ keyword is added to a base class method declaration to enable dynamic runtime polymorphism (virtual dispatch)?',
    options: ['override', 'dynamic', 'virtual', 'abstract'],
    correctIndex: 2,
    explanation: 'Declaring a method `virtual` instructs the compiler to use a vtable pointer for late binding, allowing derived class implementations to be called via base pointers.'
  },
  {
    id: 'cpp_5',
    topicId: 'cpp',
    topicName: 'C++',
    concept: 'References vs Pointers',
    question: 'What is a key difference between a C++ reference (`int& ref = x;`) and a pointer (`int* ptr = &x;`)?',
    options: [
      'A reference can be re-assigned to refer to a different object later, whereas a pointer cannot',
      'A reference must be initialized when declared and cannot be null; a pointer can be null and reassigned',
      'References use more heap memory than pointers',
      'References cannot be passed as arguments to functions'
    ],
    correctIndex: 1,
    explanation: 'References are aliases that must be bound to an object upon declaration and cannot be null, whereas pointers can be null and repointed.'
  }
];

// Helper functions for assessment handling
function getTopics() {
  return topics;
}

function getTopicById(topicId) {
  if (!topicId) return null;
  const normalized = topicId.toString().trim().toLowerCase();
  return topics.find(t => t.id === normalized || t.name.toLowerCase() === normalized) || null;
}

function getQuestionsByTopic(topicId, hideAnswers = true) {
  const topic = getTopicById(topicId);
  if (!topic) return [];
  const list = questions.filter(q => q.topicId === topic.id);
  
  if (hideAnswers) {
    // Strips correctIndex and explanation before sending to client during active quiz
    return list.map(q => ({
      id: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      concept: q.concept || topic.name,
      question: q.question,
      options: q.options
    }));
  }
  return list;
}

function scoreQuiz(topicId, submittedAnswers) {
  const topic = getTopicById(topicId);
  if (!topic) throw new Error('Invalid topic');

  const quizQuestions = questions.filter(q => q.topicId === topic.id).slice(0, 5);
  let score = 0;
  const detailedResults = [];
  const topicsToImproveSet = new Set();

  quizQuestions.forEach((q, idx) => {
    let selectedIndex = -1;
    if (Array.isArray(submittedAnswers)) {
      selectedIndex = submittedAnswers[idx] !== undefined && submittedAnswers[idx] !== null && submittedAnswers[idx] !== ''
        ? parseInt(submittedAnswers[idx], 10)
        : -1;
    } else if (submittedAnswers && typeof submittedAnswers === 'object') {
      const rawAnswer = submittedAnswers[q.id] !== undefined
        ? submittedAnswers[q.id]
        : submittedAnswers[idx];
      selectedIndex = (rawAnswer !== undefined && rawAnswer !== null && rawAnswer !== '')
        ? parseInt(rawAnswer, 10)
        : -1;
    }

    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) {
      score++;
    } else {
      if (q.concept) {
        topicsToImproveSet.add(q.concept);
      }
    }

    detailedResults.push({
      questionId: q.id,
      questionText: q.question,
      concept: q.concept || topic.name,
      options: q.options,
      selectedOptionIndex: selectedIndex,
      selectedOptionText: (selectedIndex >= 0 && selectedIndex < q.options.length)
        ? q.options[selectedIndex]
        : 'No answer selected',
      correctOptionIndex: q.correctIndex,
      correctOptionText: q.options[q.correctIndex],
      isCorrect: isCorrect,
      explanation: q.explanation || 'No explanation provided.'
    });
  });

  const totalQuestions = quizQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 60;

  // Encouraging feedback and actionable recommendations
  let classification = 'Needs Improvement';
  let encouragingFeedback = '';
  let recommendation = '';

  const topicsToImprove = Array.from(topicsToImproveSet);
  const topicsPhrase = topicsToImprove.length > 0
    ? `focusing especially on ${topicsToImprove.slice(0, 3).join(', ')}`
    : 'solidifying your conceptual mastery';

  if (score >= 4) {
    classification = 'Strong Foundation';
    encouragingFeedback = 'Outstanding work! You have demonstrated strong foundational command of this skill.';
    recommendation = `You have proven strong understanding in ${topic.name}. Proceed to intermediate and advanced hands-on projects, code challenges, and portfolio building.`;
  } else if (score >= 2) {
    classification = 'Developing';
    encouragingFeedback = 'Good effort! You have solid baseline knowledge and are on the right track.';
    recommendation = `Continue practicing ${topic.name} by ${topicsPhrase}. Work through short practical exercises and code examples to strengthen these concepts.`;
  } else {
    classification = 'Needs Improvement';
    encouragingFeedback = 'Every expert started as a beginner. Use this assessment as a clear roadmap for what to learn next!';
    recommendation = `Recommended next step: review core ${topic.name} fundamentals, ${topicsPhrase}, using interactive tutorials, official documentation, and guided practice tasks.`;
  }

  return {
    topic: topic.name,
    topicId: topic.id,
    displayName: topic.displayName || topic.name,
    score,
    totalQuestions,
    percentage,
    passed,
    classification,
    encouragingFeedback,
    recommendation,
    topicsToImprove,
    answers: detailedResults
  };
}

module.exports = {
  topics,
  questions,
  getTopics,
  getTopicById,
  getQuestionsByTopic,
  scoreQuiz
};
