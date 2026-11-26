const { topics, questions, getQuestionsByTopic } = require('../data/questions');

let totalIssues = 0;
topics.forEach(t => {
  const qs = getQuestionsByTopic(t.id, false);
  console.log(`\n=== Topic: ${t.id} (${t.displayName || t.name}) [${t.skillCategory}] ===`);
  if (qs.length !== 5) {
    console.error(`  [ISSUE] Topic has ${qs.length} questions, expected 5!`);
    totalIssues++;
  }
  qs.forEach((q, idx) => {
    const qNum = idx + 1;
    if (!q.question || q.question.trim() === '') {
      console.error(`  [ISSUE] Q${qNum} has empty question text!`);
      totalIssues++;
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      console.error(`  [ISSUE] Q${qNum} does not have exactly 4 options! Count: ${q.options ? q.options.length : 0}`);
      totalIssues++;
    } else {
      q.options.forEach((opt, oIdx) => {
        if (opt === null || opt === undefined || String(opt).trim() === '') {
          console.error(`  [ISSUE] Q${qNum} Option ${oIdx} is empty or null!`);
          totalIssues++;
        }
      });
      // Check for duplicate options
      const optSet = new Set(q.options.map(o => String(o).trim().toLowerCase()));
      if (optSet.size !== q.options.length) {
        console.error(`  [ISSUE] Q${qNum} has duplicate options:`, q.options);
        totalIssues++;
      }
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
      console.error(`  [ISSUE] Q${qNum} has invalid correctIndex: ${q.correctIndex}`);
      totalIssues++;
    }
    if (!q.explanation || q.explanation.trim() === '') {
      console.error(`  [ISSUE] Q${qNum} has empty explanation!`);
      totalIssues++;
    }
  });
});

console.log(`\nScan complete. Total issues found: ${totalIssues}`);
