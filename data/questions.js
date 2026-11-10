/**
 * Practice Assessment Questions Module
 * Trusted server-side repository for multiple-choice quiz questions.
 * Correct answers and explanations remain on the server and are only returned
 * after quiz submission.
 */

const topics = [
  {
    id: 'html',
    name: 'HTML',
    displayName: 'HTML & Semantic Markup',
    icon: 'bi-filetype-html',
    description: 'Test your understanding of semantic HTML5 tags, document structure, forms, and web accessibility attributes.',
    questionCount: 5,
    estimatedMinutes: 5
  },
  {
    id: 'css',
    name: 'CSS',
    displayName: 'CSS3 & Responsive Styling',
    icon: 'bi-filetype-css',
    description: 'Evaluate your knowledge of the CSS box model, Flexbox, Grid, selectors, specificity, and responsive design.',
    questionCount: 5,
    estimatedMinutes: 5
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    displayName: 'JavaScript & Modern ES6+',
    icon: 'bi-filetype-js',
    description: 'Assess core JavaScript concepts including data types, closures, array methods, DOM interaction, and async/promises.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'sql',
    name: 'SQL',
    displayName: 'SQL & Relational Databases',
    icon: 'bi-database',
    description: 'Verify your proficiency with SQL queries, table joins, aggregation functions, filtering, and database normalization.',
    questionCount: 5,
    estimatedMinutes: 6
  },
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    displayName: 'Programming & CS Fundamentals',
    icon: 'bi-gear-wide-connected',
    description: 'Test fundamental concepts of algorithms, data structures, Big-O notation, control flow, and clean code.',
    questionCount: 5,
    estimatedMinutes: 6
  }
];

const questions = [
  // HTML Questions
  {
    id: 'html_1',
    topicId: 'html',
    topicName: 'HTML',
    question: 'Which HTML5 element should be used to wrap autonomous, self-contained content intended for independent distribution or syndication (such as a blog post)?',
    options: ['<section>', '<article>', '<div>', '<aside>'],
    correctIndex: 1,
    explanation: 'The <article> element represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable.'
  },
  {
    id: 'html_2',
    topicId: 'html',
    topicName: 'HTML',
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
    question: 'In an HTML form, which input attribute is used to group related radio buttons so that only one can be selected at a time?',
    options: ['id', 'class', 'name', 'value'],
    correctIndex: 2,
    explanation: 'Radio buttons with identical "name" attributes belong to the same mutual exclusion group; only one in the group can be checked at any given time.'
  },
  {
    id: 'html_4',
    topicId: 'html',
    topicName: 'HTML',
    question: 'Which of the following is NOT a semantic HTML5 tag?',
    options: ['<nav>', '<header>', '<center>', '<main>'],
    correctIndex: 2,
    explanation: '<center> is a deprecated presentational HTML4 tag removed in HTML5. Modern web standards require CSS for centering and semantic tags for layout.'
  },
  {
    id: 'html_5',
    topicId: 'html',
    topicName: 'HTML',
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

  // CSS Questions
  {
    id: 'css_1',
    topicId: 'css',
    topicName: 'CSS',
    question: 'In the standard CSS box model, which layer sits immediately between the content area and the border?',
    options: ['Margin', 'Padding', 'Outline', 'Border-radius'],
    correctIndex: 1,
    explanation: 'From inside to outside, the CSS box model consists of: Content -> Padding -> Border -> Margin.'
  },
  {
    id: 'css_2',
    topicId: 'css',
    topicName: 'CSS',
    question: 'When using CSS Flexbox on a container, which property aligns flex items along the cross-axis?',
    options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
    correctIndex: 1,
    explanation: '"justify-content" controls alignment along the main axis, while "align-items" controls alignment along the cross axis.'
  },
  {
    id: 'css_3',
    topicId: 'css',
    topicName: 'CSS',
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

  // JavaScript Questions
  {
    id: 'js_1',
    topicId: 'javascript',
    topicName: 'JavaScript',
    question: 'What is the output of `typeof null` in standard JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2,
    explanation: '`typeof null` evaluates to "object" due to a historical legacy bug in the original 1995 JavaScript implementation that has been preserved for backward compatibility.'
  },
  {
    id: 'js_2',
    topicId: 'javascript',
    topicName: 'JavaScript',
    question: 'Which array method creates a new array populated with the results of calling a provided function on every element in the calling array?',
    options: ['forEach()', 'map()', 'filter()', 'reduce()'],
    correctIndex: 1,
    explanation: 'Array.prototype.map() returns a brand new array with transformed elements without mutating the original array.'
  },
  {
    id: 'js_3',
    topicId: 'javascript',
    topicName: 'JavaScript',
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

  // SQL Questions
  {
    id: 'sql_1',
    topicId: 'sql',
    topicName: 'SQL',
    question: 'Which SQL clause is used to filter group records generated by a GROUP BY statement?',
    options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
    correctIndex: 1,
    explanation: 'The WHERE clause filters individual rows before grouping, while the HAVING clause filters aggregated groups after the GROUP BY operation has occurred.'
  },
  {
    id: 'sql_2',
    topicId: 'sql',
    topicName: 'SQL',
    question: 'Which type of JOIN returns all records from the left table, and matching records from the right table (filling with NULLs when there is no match)?',
    options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
    correctIndex: 2,
    explanation: 'A LEFT JOIN (or LEFT OUTER JOIN) preserves every row from the left table regardless of whether a matching record exists on the right.'
  },
  {
    id: 'sql_3',
    topicId: 'sql',
    topicName: 'SQL',
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
    question: 'Which aggregate function counts the total number of non-null values in a specified column?',
    options: ['TOTAL()', 'SUM()', 'COUNT()', 'ROWS()'],
    correctIndex: 2,
    explanation: '`COUNT(column_name)` returns the number of non-null rows in that column, whereas `COUNT(*)` counts total rows including nulls.'
  },

  // Programming Fundamentals Questions
  {
    id: 'prog_1',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'In a balanced binary search tree, each comparison cuts the search space in half, yielding O(log n) average time complexity.'
  },
  {
    id: 'prog_2',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
    question: 'Which data structure operates on a Last-In, First-Out (LIFO) basis?',
    options: ['Queue', 'Stack', 'Linked List', 'Array'],
    correctIndex: 1,
    explanation: 'A Stack follows the LIFO principle, where elements are added (pushed) and removed (popped) from the top.'
  },
  {
    id: 'prog_3',
    topicId: 'programming-fundamentals',
    topicName: 'Programming Fundamentals',
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
    question: 'Which of the following is considered an in-place sorting algorithm with O(1) auxiliary space complexity?',
    options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Radix Sort'],
    correctIndex: 2,
    explanation: 'Bubble Sort modifies the array directly without allocating additional array structures, requiring O(1) auxiliary space.'
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
      question: q.question,
      options: q.options
    }));
  }
  return list;
}

function scoreQuiz(topicId, submittedAnswers) {
  const topic = getTopicById(topicId);
  if (!topic) throw new Error('Invalid topic');

  const quizQuestions = questions.filter(q => q.topicId === topic.id);
  let score = 0;
  const detailedResults = [];

  quizQuestions.forEach(q => {
    const rawAnswer = submittedAnswers ? submittedAnswers[q.id] : undefined;
    const selectedIndex = (rawAnswer !== undefined && rawAnswer !== '') ? parseInt(rawAnswer, 10) : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) score++;

    detailedResults.push({
      questionId: q.id,
      questionText: q.question,
      selectedOptionIndex: selectedIndex,
      selectedOptionText: (selectedIndex >= 0 && selectedIndex < q.options.length) ? q.options[selectedIndex] : 'No answer selected',
      correctOptionIndex: q.correctIndex,
      correctOptionText: q.options[q.correctIndex],
      isCorrect: isCorrect,
      explanation: q.explanation
    });
  });

  const totalQuestions = quizQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  return {
    topic: topic.name,
    topicId: topic.id,
    score,
    totalQuestions,
    percentage,
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
