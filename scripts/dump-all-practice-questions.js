const { topics, questions } = require('../data/questions');

console.log(`Total questions in questions array: ${questions.length}`);

// Group by topic
const byTopic = {};
questions.forEach(q => {
  if (!byTopic[q.topicId]) byTopic[q.topicId] = [];
  byTopic[q.topicId].push(q);
});

Object.keys(byTopic).forEach(topicId => {
  const qs = byTopic[topicId];
  console.log(`\n=================== Topic: ${topicId} (${qs.length} questions) ===================`);
  qs.forEach((q, idx) => {
    console.log(`\n--- Question ${idx + 1} (id: ${q.id}) ---`);
    console.log(`Q: ${q.question}`);
    console.log(`Concept: ${q.concept}`);
    console.log(`Options (${q.options ? q.options.length : 0}):`);
    if (q.options) {
      q.options.forEach((opt, oIdx) => {
        const letters = ['A', 'B', 'C', 'D'];
        console.log(`  ${letters[oIdx]}. "${opt}"`);
      });
    }
    console.log(`Correct: ${q.correctIndex} -> "${q.options ? q.options[q.correctIndex] : 'NONE'}"`);
    console.log(`Explanation: ${q.explanation}`);
  });
});
