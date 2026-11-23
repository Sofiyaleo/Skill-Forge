/**
 * data/entranceQuestions.js
 * Comprehensive Question Bank for Student Entrance Assessment
 * and Automatic Skill Level Identification.
 *
 * Each skill assessment contains EXACTLY 5 progressive questions covering:
 * - Multiple-choice questions
 * - Concept-based questions
 * - Code-output prediction questions
 * - Basic practical logic questions
 *
 * Configurable Skill Level Identification Thresholds:
 * - 0–1 correct: Beginner
 * - 2–3 correct: Intermediate
 * - 4–5 correct: Advanced
 */

const SKILL_LEVEL_THRESHOLDS = {
  BEGINNER_MAX: 1,      // 0–1 correct -> Beginner
  INTERMEDIATE_MAX: 3,  // 2–3 correct -> Intermediate
  ADVANCED_MIN: 4       // 4–5 correct -> Advanced
};

/**
 * Determine proficiency level from score out of 5 based on configurable criteria
 */
function calculateSkillLevel(score) {
  if (score >= SKILL_LEVEL_THRESHOLDS.ADVANCED_MIN) {
    return 'Advanced';
  }
  if (score >= SKILL_LEVEL_THRESHOLDS.BEGINNER_MAX + 1) {
    return 'Intermediate';
  }
  return 'Beginner';
}

const entranceQuestionBank = {
  // ==========================================
  // HTML (5 Progressive Questions)
  // ==========================================
  html: {
    skillKey: 'html',
    skillName: 'HTML',
    category: 'Web Development',
    description: 'Evaluates document markup, semantic tags, accessibility, forms, and DOM structure.',
    questions: [
      {
        id: 'html_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the purpose of the <!DOCTYPE html> declaration at the start of an HTML file?',
        options: [
          'It instructs the browser about the HTML version and enforces standards mode rendering',
          'It connects the web page to the remote MongoDB database',
          'It compiles embedded JavaScript into machine language',
          'It sets the default language of the document to English'
        ],
        correctOptionIndex: 0,
        explanation: '<!DOCTYPE html> instructs web browsers to render the document in modern standard HTML5 mode.'
      },
      {
        id: 'html_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which HTML element is used to define a hyperlink to another page or resource?',
        options: ['<a>', '<link>', '<href>', '<url>'],
        correctOptionIndex: 0,
        explanation: 'The anchor element <a> with the href attribute creates hyperlinks.'
      },
      {
        id: 'html_3',
        type: 'mcq',
        difficulty: 'Intermediate',
        question: 'Which attribute specifies alternative descriptive text for screen readers and failed image loads?',
        options: ['title', 'alt', 'caption', 'src-text'],
        correctOptionIndex: 1,
        explanation: 'The "alt" attribute provides accessible alternative text for <img> elements.'
      },
      {
        id: 'html_4',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What will be rendered in the browser for this snippet?\n<p>SkillForge <strong>&amp;</strong> Career</p>',
        options: [
          'SkillForge & Career (with & rendered in bold text)',
          'SkillForge &amp; Career literally',
          'SkillForge AND Career',
          'A browser syntax error occurs'
        ],
        correctOptionIndex: 0,
        explanation: '&amp; is the HTML entity representing the & symbol, and <strong> renders it bold.'
      },
      {
        id: 'html_5',
        type: 'practical_logic',
        difficulty: 'Advanced',
        question: 'In an HTML form, how do you group multiple radio buttons so that selecting one automatically deselects all others in that group?',
        options: [
          'Assign the exact same "name" attribute to all radio buttons in that group',
          'Assign identical "id" attributes to all radio buttons',
          'Wrap the radio buttons inside a <fieldset> with single="true"',
          'Add a "unique" attribute to each radio button'
        ],
        correctOptionIndex: 0,
        explanation: 'Radio buttons sharing the same "name" attribute form a mutually exclusive selection group.'
      }
    ]
  },

  // ==========================================
  // CSS (5 Progressive Questions)
  // ==========================================
  css: {
    skillKey: 'css',
    skillName: 'CSS',
    category: 'Web Development',
    description: 'Evaluates Box Model, Flexbox layout, specificity, selectors, and responsive design.',
    questions: [
      {
        id: 'css_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the fundamental difference between margin and padding in the CSS Box Model?',
        options: [
          'Margin is the space outside an element border; padding is the space inside between content and border',
          'Padding applies only to text; margin applies only to images',
          'Margin changes the element background color; padding is always transparent',
          'Padding is always outside the border; margin is always inside the border'
        ],
        correctOptionIndex: 0,
        explanation: 'Margin clears space outside the border; padding clears space inside between content and border.'
      },
      {
        id: 'css_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which CSS property is used to change the background color of an element?',
        options: ['background-color', 'color', 'surface-fill', 'bgcolor'],
        correctOptionIndex: 0,
        explanation: '"background-color" sets the background color, while "color" sets foreground text color.'
      },
      {
        id: 'css_3',
        type: 'concept',
        difficulty: 'Intermediate',
        question: 'What is the primary purpose of the CSS Flexbox layout model?',
        options: [
          'To align, space, and distribute items dynamically within a container along a one-dimensional axis',
          'To connect client interfaces to remote SQL databases',
          'To execute server-side Node.js scripts',
          'To compile SCSS files into binary bytecode'
        ],
        correctOptionIndex: 0,
        explanation: 'Flexbox provides one-dimensional alignment, distribution, and sizing for flexible containers.'
      },
      {
        id: 'css_4',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'How do you perfectly center a child element both horizontally and vertically inside a flex container?',
        options: [
          'display: flex; justify-content: center; align-items: center;',
          'display: flex; text-align: center; vertical-align: middle;',
          'display: flex; margin: auto; float: center;',
          'display: flex; place-content: between-center;'
        ],
        correctOptionIndex: 0,
        explanation: 'justify-content: center centers along the main axis; align-items: center centers along the cross axis.'
      },
      {
        id: 'css_5',
        type: 'code_output',
        difficulty: 'Advanced',
        question: 'Given the CSS:\np { color: blue; }\n#banner p { color: red; }\np.announcement { color: green; }\nWhat is the color of <div id="banner"><p class="announcement">Alert</p></div>?',
        options: ['red', 'green', 'blue', 'black'],
        correctOptionIndex: 0,
        explanation: 'The ID selector (#banner p) has higher specificity (1, 0, 1) than the class selector (p.announcement: 0, 1, 1).'
      }
    ]
  },

  // ==========================================
  // JAVASCRIPT (5 Progressive Questions)
  // ==========================================
  javascript: {
    skillKey: 'javascript',
    skillName: 'JavaScript',
    category: 'Programming',
    description: 'Evaluates ES6+ syntax, let vs const, data types, closures, array methods, and async concepts.',
    questions: [
      {
        id: 'js_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the primary difference between let and const in modern JavaScript (ES6+)?',
        options: [
          'Variables declared with "let" can be reassigned; variables declared with "const" cannot be reassigned',
          '"let" has function scope while "const" has block scope',
          '"const" can only store string literals while "let" can store any type',
          '"const" variables are hoisted to global scope while "let" is not'
        ],
        correctOptionIndex: 0,
        explanation: 'Both let and const are block-scoped, but const identifiers cannot be reassigned.'
      },
      {
        id: 'js_2',
        type: 'code_output',
        difficulty: 'Beginner',
        question: 'What will be the output of this JavaScript expression?\nconsole.log(1 + "2" + 3);',
        options: ['"123"', '6', '"33"', 'NaN'],
        correctOptionIndex: 0,
        explanation: 'Binary + with a string coerces operands to strings: 1 + "2" becomes "12", then "12" + 3 becomes "123".'
      },
      {
        id: 'js_3',
        type: 'concept',
        difficulty: 'Intermediate',
        question: 'What is the purpose of the Array.prototype.map() method in JavaScript?',
        options: [
          'To create a new array populated with the results of calling a provided function on every element',
          'To filter elements based on a condition without altering the array',
          'To sort array elements in-place in ascending order',
          'To search for the first matching element index'
        ],
        correctOptionIndex: 0,
        explanation: 'map() returns a new array where each item is transformed by the callback function.'
      },
      {
        id: 'js_4',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What will be printed to the console?\nlet x = 5;\nlet y = x++;\nconsole.log(y, x);',
        options: ['5 6', '6 6', '5 5', '6 5'],
        correctOptionIndex: 0,
        explanation: 'The post-increment operator (x++) returns the original value (5) before incrementing x to 6.'
      },
      {
        id: 'js_5',
        type: 'practical_logic',
        difficulty: 'Advanced',
        question: 'What does a JavaScript Promise represent in asynchronous programming?',
        options: [
          'The eventual completion (or failure) of an asynchronous operation and its resulting value',
          'A synchronous loop that blocks user input until data is fetched',
          'An encrypted token saved in the browser cookie jar',
          'A compile-time guarantee that code contains zero type errors'
        ],
        correctOptionIndex: 0,
        explanation: 'A Promise is a proxy for a value not necessarily known when created, representing an async status.'
      }
    ]
  },

  // ==========================================
  // SQL (5 Progressive Questions)
  // ==========================================
  sql: {
    skillKey: 'sql',
    skillName: 'SQL',
    category: 'Database',
    description: 'Evaluates relational querying, filtering, aggregation, and table joins.',
    questions: [
      {
        id: 'sql_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the primary role of a PRIMARY KEY in a relational database table?',
        options: [
          'To uniquely identify each record in the table without allowing NULL values',
          'To encrypt sensitive passwords stored in the database disk',
          'To sort records automatically in alphabetical order',
          'To establish an internet connection to the database server'
        ],
        correctOptionIndex: 0,
        explanation: 'A primary key uniquely identifies each table row and cannot contain nulls.'
      },
      {
        id: 'sql_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which SQL clause is used to filter records returned by a SELECT statement?',
        options: ['WHERE', 'ORDER BY', 'GROUP BY', 'FILTER'],
        correctOptionIndex: 0,
        explanation: 'The WHERE clause filters rows matching a specified condition.'
      },
      {
        id: 'sql_3',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What does the query:\nSELECT COUNT(*) FROM students WHERE score >= 60;\nreturn?',
        options: [
          'The total number of students with a score of 60 or higher',
          'The average score of all passing students',
          'A list of student records sorted by score',
          'The highest score in the table'
        ],
        correctOptionIndex: 0,
        explanation: 'COUNT(*) calculates the total quantity of rows matching the WHERE criteria.'
      },
      {
        id: 'sql_4',
        type: 'concept',
        difficulty: 'Intermediate',
        question: 'What is the difference between WHERE and HAVING in SQL?',
        options: [
          'WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY',
          'WHERE works only on numbers; HAVING works only on strings',
          'HAVING is for DELETE queries; WHERE is for SELECT queries',
          'There is no difference; they are exact synonyms'
        ],
        correctOptionIndex: 0,
        explanation: 'WHERE filters individual records prior to aggregation; HAVING filters aggregated result groups.'
      },
      {
        id: 'sql_5',
        type: 'practical_logic',
        difficulty: 'Advanced',
        question: 'Which type of JOIN returns all records from the left table, along with matching rows from the right table (or NULL if no match)?',
        options: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
        correctOptionIndex: 0,
        explanation: 'LEFT JOIN (or LEFT OUTER JOIN) preserves all rows from the left table.'
      }
    ]
  },

  // ==========================================
  // PYTHON (5 Progressive Questions)
  // ==========================================
  python: {
    skillKey: 'python',
    skillName: 'Python',
    category: 'Programming',
    description: 'Evaluates Python syntax, data types, functions, list comprehensions, and dictionaries.',
    questions: [
      {
        id: 'py_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'Which of the following built-in data types in Python is IMMUTABLE?',
        options: ['tuple', 'list', 'dict', 'set'],
        correctOptionIndex: 0,
        explanation: 'Tuples, strings, and integers are immutable in Python.'
      },
      {
        id: 'py_2',
        type: 'code_output',
        difficulty: 'Beginner',
        question: 'What will be the output of this Python code?\nnums = [1, 2, 3]\nprint(nums * 2)',
        options: ['[1, 2, 3, 1, 2, 3]', '[2, 4, 6]', 'TypeError', '[1, 2, 3, 2]'],
        correctOptionIndex: 0,
        explanation: 'Multiplying a list by an integer n repeats the list n times.'
      },
      {
        id: 'py_3',
        type: 'mcq',
        difficulty: 'Intermediate',
        question: 'Which keyword is used to define a reusable function in Python?',
        options: ['def', 'function', 'fn', 'lambda-func'],
        correctOptionIndex: 0,
        explanation: 'The "def" keyword begins a function definition in Python.'
      },
      {
        id: 'py_4',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What is the output of this list comprehension?\nres = [x * 2 for x in range(3)]\nprint(res)',
        options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
        correctOptionIndex: 0,
        explanation: 'range(3) produces 0, 1, 2. Doubling each produces [0, 2, 4].'
      },
      {
        id: 'py_5',
        type: 'practical_logic',
        difficulty: 'Advanced',
        question: 'What is the recommended, pythonic way to open and read a file ensuring it is safely closed even if exceptions occur?',
        options: [
          'with open("data.txt", "r") as f: content = f.read()',
          'f = open("data.txt"); content = f.read()',
          'file.read("data.txt", close=True)',
          'open("data.txt").execute(read)'
        ],
        correctOptionIndex: 0,
        explanation: 'The "with" statement guarantees context management and automatic file closing.'
      }
    ]
  },

  // ==========================================
  // JAVA (5 Progressive Questions)
  // ==========================================
  java: {
    skillKey: 'java',
    skillName: 'Java',
    category: 'Programming',
    description: 'Evaluates OOP, classes, inheritance, JVM bytecode execution, and Java collections.',
    questions: [
      {
        id: 'java_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the primary role of the Java Virtual Machine (JVM)?',
        options: [
          'To execute compiled Java bytecode on the host OS, enabling platform independence',
          'To compile .java source code directly to C++',
          'To manage relational database backups',
          'To design responsive web layouts'
        ],
        correctOptionIndex: 0,
        explanation: 'The JVM executes platform-independent bytecode (.class files).'
      },
      {
        id: 'java_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which keyword in Java is used to inherit from a superclass?',
        options: ['extends', 'implements', 'inherits', 'subclass'],
        correctOptionIndex: 0,
        explanation: 'A class uses "extends" to inherit another class.'
      },
      {
        id: 'java_3',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What does this statement output?\nString s1 = "Hello";\nString s2 = "Hello";\nSystem.out.println(s1 == s2);',
        options: ['true', 'false', 'NullPointerException', 'Compilation error'],
        correctOptionIndex: 0,
        explanation: 'String literals are placed in the String Constant Pool, so s1 and s2 share the exact reference.'
      },
      {
        id: 'java_4',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'How do you check for textual content equality between two Java String instances?',
        options: ['s1.equals(s2)', 's1 == s2', 's1 = s2', 's1.compareTo(s2) == -1'],
        correctOptionIndex: 0,
        explanation: '.equals() evaluates string contents, whereas == compares memory references.'
      },
      {
        id: 'java_5',
        type: 'concept',
        difficulty: 'Advanced',
        question: 'What does the "static" keyword denote when applied to a method in Java?',
        options: [
          'The method belongs to the class itself rather than instances and can be called without creating an object',
          'The method cannot be called more than once during execution',
          'The method variable is permanently stored in local browser cache',
          'The method runs strictly on background CPU threads'
        ],
        correctOptionIndex: 0,
        explanation: 'Static methods belong to the class and are called directly as ClassName.methodName().'
      }
    ]
  },

  // ==========================================
  // REACT (5 Progressive Questions)
  // ==========================================
  react: {
    skillKey: 'react',
    skillName: 'React',
    category: 'Web Development',
    description: 'Evaluates component architecture, JSX, props, state, hooks, and virtual DOM.',
    questions: [
      {
        id: 'react_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is the Virtual DOM in React?',
        options: [
          'A lightweight in-memory representation of the real DOM that React diffs to optimize browser updates',
          'A client-side SQL database embedded in Google Chrome',
          'A hardware accelerator for CSS3 animations',
          'A Node.js backend server pipeline'
        ],
        correctOptionIndex: 0,
        explanation: 'The Virtual DOM allows React to compute minimal real DOM operations through reconciliation.'
      },
      {
        id: 'react_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which built-in Hook is used to add local state to a functional React component?',
        options: ['useState', 'useEffect', 'useReducer', 'useContext'],
        correctOptionIndex: 0,
        explanation: 'useState is the primary React Hook for state management in functional components.'
      },
      {
        id: 'react_3',
        type: 'concept',
        difficulty: 'Intermediate',
        question: 'What is the key difference between "props" and "state" in React?',
        options: [
          'Props are read-only inputs passed from parents; state is managed internally by the component',
          'State is passed down from parent components; props are local and mutable',
          'Props can only hold strings; state can only hold numbers',
          'Props are only used in class components; state only in functions'
        ],
        correctOptionIndex: 0,
        explanation: 'Props are external inputs passed into a component; state is internal mutable data.'
      },
      {
        id: 'react_4',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'Why should list items rendered with .map() in React have a unique "key" prop?',
        options: [
          'Keys give elements a stable identity so React can identify which items changed, added, or removed',
          'Keys are required for CSS selectors to match items',
          'Keys automatically sort array items alphabetically',
          'Keys prevent memory leaks in the browser'
        ],
        correctOptionIndex: 0,
        explanation: 'Keys allow React reconciliation algorithm to track list items across re-renders.'
      },
      {
        id: 'react_5',
        type: 'code_output',
        difficulty: 'Advanced',
        question: 'When does the effect in useEffect(() => { ... }, []) execute?',
        options: [
          'Only once, after the initial component mount',
          'On every single re-render of the component',
          'Only when the component is unmounted',
          'Synchronously before the DOM is painted'
        ],
        correctOptionIndex: 0,
        explanation: 'An empty dependency array [] runs the effect only once when the component mounts.'
      }
    ]
  },

  // ==========================================
  // NODE.JS (5 Progressive Questions)
  // ==========================================
  node: {
    skillKey: 'node',
    skillName: 'Node.js',
    category: 'Web Development',
    description: 'Evaluates asynchronous server JavaScript, event loop, Express routing, and middleware.',
    questions: [
      {
        id: 'node_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is Node.js?',
        options: [
          'An asynchronous, event-driven JavaScript runtime built on Chrome V8 engine for server-side apps',
          'A relational database management system',
          'A client-side CSS framework',
          'A new programming language distinct from JavaScript'
        ],
        correctOptionIndex: 0,
        explanation: 'Node.js enables JavaScript to execute on servers outside the web browser.'
      },
      {
        id: 'node_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'In Express.js middleware, which function call passes control to the next middleware handler?',
        options: ['next()', 'continue()', 'forward()', 'done()'],
        correctOptionIndex: 0,
        explanation: 'next() passes request control to the next middleware in the pipeline.'
      },
      {
        id: 'node_3',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'In an Express route /api/users/:id, how do you access the dynamic "id" parameter inside the handler?',
        options: ['req.params.id', 'req.query.id', 'req.body.id', 'req.headers.id'],
        correctOptionIndex: 0,
        explanation: 'Named route parameters prefixed with : are available on req.params.'
      },
      {
        id: 'node_4',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'Which built-in Express middleware is used to parse incoming JSON request payloads into req.body?',
        options: ['express.json()', 'express.parseJson()', 'express.bodyParser()', 'express.payload()'],
        correctOptionIndex: 0,
        explanation: 'express.json() is the standard middleware for parsing incoming JSON bodies.'
      },
      {
        id: 'node_5',
        type: 'concept',
        difficulty: 'Advanced',
        question: 'Why can single-threaded Node.js handle thousands of concurrent I/O requests efficiently?',
        options: [
          'It uses an event loop and non-blocking asynchronous system calls via libuv',
          'It spawns a new physical OS process for every incoming HTTP packet',
          'It restricts server operations to synchronous in-memory computations',
          'It pauses all other network traffic while a database query executes'
        ],
        correctOptionIndex: 0,
        explanation: 'The event loop delegates heavy I/O to system threads, remaining non-blocking for concurrent connections.'
      }
    ]
  },

  // ==========================================
  // GIT & GITHUB (5 Progressive Questions)
  // ==========================================
  git: {
    skillKey: 'git',
    skillName: 'Git & GitHub',
    category: 'Tools and Platforms',
    description: 'Evaluates version control, repository staging, commits, branches, and merge workflows.',
    questions: [
      {
        id: 'git_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What is Git?',
        options: [
          'A distributed version control system designed to track changes in source code files over time',
          'A cloud hosting platform for databases',
          'A compiler for JavaScript scripts',
          'A replacement for web browsers'
        ],
        correctOptionIndex: 0,
        explanation: 'Git is a distributed version control tool that records file changes.'
      },
      {
        id: 'git_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which command records staged snapshots to the local repository with a commit message?',
        options: ['git commit -m "message"', 'git save "message"', 'git push -m "message"', 'git store "message"'],
        correctOptionIndex: 0,
        explanation: 'git commit -m creates a new commit in repository history.'
      },
      {
        id: 'git_3',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'Which command creates and immediately switches to a new branch named "feature-login"?',
        options: ['git checkout -b feature-login', 'git branch --create feature-login', 'git switch --only feature-login', 'git fork feature-login'],
        correctOptionIndex: 0,
        explanation: 'git checkout -b <branch> (or git switch -c <branch>) creates and checks out the new branch.'
      },
      {
        id: 'git_4',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What command uploads committed local changes to the remote "main" branch on GitHub?',
        options: ['git push origin main', 'git upload remote main', 'git publish main', 'git sync local main'],
        correctOptionIndex: 0,
        explanation: 'git push transmits local commits to the remote repository.'
      },
      {
        id: 'git_5',
        type: 'concept',
        difficulty: 'Advanced',
        question: 'What happens when a "merge conflict" occurs during a Git merge operation?',
        options: [
          'Competing edits on the same lines must be manually reconciled by the developer before completing the merge',
          'The repository is erased automatically to avoid corruption',
          'Git discards the newer branch commits silently',
          'The remote GitHub server permanently blocks future pushes'
        ],
        correctOptionIndex: 0,
        explanation: 'Merge conflicts require manual resolution when changes on the same line cannot be merged cleanly.'
      }
    ]
  },

  // ==========================================
  // DATA STRUCTURES & ALGORITHMS (5 Progressive Questions)
  // ==========================================
  dsa: {
    skillKey: 'dsa',
    skillName: 'Data Structures & Algorithms',
    category: 'Core CS',
    description: 'Evaluates stacks, queues, binary search, linked lists, and Big-O asymptotic analysis.',
    questions: [
      {
        id: 'dsa_1',
        type: 'concept',
        difficulty: 'Beginner',
        question: 'What does Big-O notation describe in algorithm analysis?',
        options: [
          'The upper bound on time or space complexity as input size grows toward infinity',
          'The exact milliseconds of execution on a specific CPU',
          'The physical hard drive space of the server',
          'The total number of code comments'
        ],
        correctOptionIndex: 0,
        explanation: 'Big-O notation quantifies asymptotic worst-case algorithmic complexity.'
      },
      {
        id: 'dsa_2',
        type: 'mcq',
        difficulty: 'Beginner',
        question: 'Which operational principle governs a Stack data structure?',
        options: ['LIFO (Last-In, First-Out)', 'FIFO (First-In, First-Out)', 'Random Direct Access', 'Priority Ordering'],
        correctOptionIndex: 0,
        explanation: 'Stacks operate on LIFO: the last pushed item is the first popped.'
      },
      {
        id: 'dsa_3',
        type: 'practical_logic',
        difficulty: 'Intermediate',
        question: 'What essential precondition must be satisfied before performing a Binary Search on an array?',
        options: [
          'The elements in the array must be sorted in order',
          'The array length must be a power of two',
          'The array must contain only positive numbers',
          'The array must not contain strings'
        ],
        correctOptionIndex: 0,
        explanation: 'Binary search repeatedly divides the search space in half, requiring sorted order.'
      },
      {
        id: 'dsa_4',
        type: 'code_output',
        difficulty: 'Intermediate',
        question: 'What is the worst-case time complexity of Binary Search on a sorted array of size n?',
        options: ['O(log n)', 'O(n)', 'O(n^2)', 'O(1)'],
        correctOptionIndex: 0,
        explanation: 'Halving the search space at each step yields O(log n) time complexity.'
      },
      {
        id: 'dsa_5',
        type: 'concept',
        difficulty: 'Advanced',
        question: 'What is a key advantage of a singly Linked List over a standard contiguous Array?',
        options: [
          'Inserting or deleting nodes at the beginning takes O(1) time without shifting other elements',
          'Linked lists allow O(1) random index access',
          'Linked lists use less memory than arrays',
          'Linked lists are sorted automatically'
        ],
        correctOptionIndex: 0,
        explanation: 'Inserting at the head of a linked list requires only pointer update (O(1)), without shifting elements.'
      }
    ]
  }
};

/**
 * Normalizes skill names from user selections to question bank keys.
 */
function normalizeSkillKey(skillName) {
  if (!skillName) return 'general';
  const clean = skillName.toLowerCase().trim();

  if (clean.includes('html')) return 'html';
  if (clean.includes('css')) return 'css';
  if (clean.includes('javascript') || (clean.includes('js') && !clean.includes('node') && !clean.includes('react'))) return 'javascript';
  if (clean.includes('sql') || clean.includes('mysql') || clean.includes('postgres')) return 'sql';
  if (clean.includes('python')) return 'python';
  if (clean.includes('java') && !clean.includes('javascript')) return 'java';
  if (clean.includes('react')) return 'react';
  if (clean.includes('node') || clean.includes('express')) return 'node';
  if (clean.includes('git')) return 'git';
  if (clean.includes('data structure') || clean.includes('algorithm') || clean.includes('dsa')) return 'dsa';

  return clean.replace(/[^a-z0-9]/g, '');
}

/**
 * Fallback: 5 progressive questions for any unlisted custom skill.
 */
function generateDynamicSkillQuestions(skillName) {
  const name = (skillName || 'Skill').trim();
  return [
    {
      id: `${name.toLowerCase()}_1`,
      type: 'concept',
      difficulty: 'Beginner',
      question: `What is the core role and primary purpose of ${name} in modern software engineering?`,
      options: [
        `It provides dedicated standards and capabilities for developing applications using ${name}`,
        `It is solely an operating system driver for monitor displays`,
        `It replaces physical computer motherboards`,
        `It is an electrical wiring protocol`
      ],
      correctOptionIndex: 0,
      explanation: `${name} is leveraged to design and build technical applications.`
    },
    {
      id: `${name.toLowerCase()}_2`,
      type: 'mcq',
      difficulty: 'Beginner',
      question: `Which fundamental principle is most critical when writing maintainable configurations or code in ${name}?`,
      options: [
        'Adhering to consistent naming conventions, separation of concerns, and clean modular structure',
        'Writing the entire program into a single monolithic script',
        'Avoiding documentation, comments, and version control',
        'Hardcoding production passwords into public scripts'
      ],
      correctOptionIndex: 0,
      explanation: 'Maintainability relies on modularity, clean architecture, and consistent conventions.'
    },
    {
      id: `${name.toLowerCase()}_3`,
      type: 'practical_logic',
      difficulty: 'Intermediate',
      question: `What is considered standard best practice for handling edge cases and errors in ${name}?`,
      options: [
        'Anticipating potential failure points with structured error handling and informative feedback',
        'Ignoring exceptions and allowing the script to terminate unexpectedly',
        'Disabling server logs to hide runtime warnings',
        'Restarting the server automatically without debugging the cause'
      ],
      correctOptionIndex: 0,
      explanation: 'Robust systems catch, log, and gracefully handle expected errors.'
    },
    {
      id: `${name.toLowerCase()}_4`,
      type: 'code_output',
      difficulty: 'Intermediate',
      question: `When designing reusable components or functions in ${name}, what does the DRY principle emphasize?`,
      options: [
        'Don\'t Repeat Yourself: reduce duplicate logic by abstracting code into reusable modules',
        'Only run automated test scripts when the weather is dry',
        'Never write comments more than once in an entire career',
        'Delete all documentation after software deployment'
      ],
      correctOptionIndex: 0,
      explanation: 'DRY minimizes repetition and reduces bugs when future edits are required.'
    },
    {
      id: `${name.toLowerCase()}_5`,
      type: 'concept',
      difficulty: 'Advanced',
      question: `Before deploying a ${name} production application, which step is considered essential?`,
      options: [
        'Conducting automated testing, security validation, code reviews, and build verification',
        'Disabling HTTPS encryption to save bandwidth',
        'Deleting all automated database backups',
        'Granting root administrator privileges to unauthenticated guest users'
      ],
      correctOptionIndex: 0,
      explanation: 'Production readiness mandates rigorous testing, security audits, and verification.'
    }
  ];
}

/**
 * Retrieves the full 5-question set for a specific skill.
 * If sanitize is true, strips out correctOptionIndex and explanation.
 */
function getQuestionsForSkill(skillName, sanitize = true) {
  const normKey = normalizeSkillKey(skillName);
  let bankEntry = entranceQuestionBank[normKey];

  let rawQuestions = [];
  let displayName = skillName;
  let category = 'Technical';
  let description = `Skill verification assessment for ${skillName}.`;

  if (bankEntry) {
    rawQuestions = bankEntry.questions.slice(0, 5); // Exactly 5 questions
    displayName = bankEntry.skillName;
    category = bankEntry.category;
    description = bankEntry.description;
  } else {
    rawQuestions = generateDynamicSkillQuestions(skillName);
  }

  if (sanitize) {
    return {
      skillName: displayName,
      normalizedKey: normKey,
      category,
      description,
      totalQuestions: 5,
      questions: rawQuestions.map((q, idx) => ({
        id: q.id || `${normKey}_${idx + 1}`,
        questionIndex: idx,
        type: q.type || 'mcq',
        difficulty: q.difficulty || 'Intermediate',
        question: q.question,
        options: q.options
      }))
    };
  }

  return {
    skillName: displayName,
    normalizedKey: normKey,
    category,
    description,
    totalQuestions: 5,
    questions: rawQuestions
  };
}

/**
 * Evaluates a student's submitted answers for a 5-question skill assessment.
 * Automatically identifies skill level:
 * - 0–1 correct: Beginner
 * - 2–3 correct: Intermediate
 * - 4–5 correct: Advanced
 */
function evaluateSkillSubmission(skillName, userAnswers) {
  const fullData = getQuestionsForSkill(skillName, false);
  const questions = fullData.questions;
  const totalQuestions = 5;

  let correctCount = 0;
  const review = [];

  questions.forEach((q, idx) => {
    let chosenIndex = -1;
    if (Array.isArray(userAnswers)) {
      chosenIndex = userAnswers[idx] !== undefined ? Number(userAnswers[idx]) : -1;
    } else if (userAnswers && typeof userAnswers === 'object') {
      chosenIndex = userAnswers[q.id] !== undefined
        ? Number(userAnswers[q.id])
        : (userAnswers[idx] !== undefined ? Number(userAnswers[idx]) : -1);
    }

    const isCorrect = chosenIndex === q.correctOptionIndex;
    if (isCorrect) {
      correctCount++;
    }

    review.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      userSelected: chosenIndex,
      correctIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation || ''
    });
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const identifiedLevel = calculateSkillLevel(correctCount);
  const passed = correctCount >= 2; // Intermediate or Advanced considered verified baseline

  return {
    skillName: fullData.skillName,
    normalizedKey: fullData.normalizedKey,
    category: fullData.category,
    score: correctCount,
    totalQuestions: 5,
    correctAnswersCount: correctCount,
    percentage,
    identifiedLevel,
    passed,
    verificationStatus: passed ? 'VERIFIED' : 'NOT VERIFIED',
    review
  };
}

module.exports = {
  SKILL_LEVEL_THRESHOLDS,
  calculateSkillLevel,
  entranceQuestionBank,
  normalizeSkillKey,
  getQuestionsForSkill,
  evaluateSkillSubmission
};
