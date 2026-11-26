const { questions, topics } = require('../data/questions');

console.log('Total topics:', topics.length);
topics.forEach(t => {
  const qs = questions.filter(q => q.topicId === t.id);
  console.log(`\nTopic: ${t.id} (${t.displayName}) | Category: ${t.skillCategory} | Questions: ${qs.length}`);
  qs.forEach((q, idx) => {
    q.options.forEach((opt, oIdx) => {
      const letters = ['A', 'B', 'C', 'D'];
      const hasSpecial = opt.includes('<') || opt.includes('>') || opt.includes('&') || opt.includes('"') || opt.includes("'") || opt.includes('`');
      if (hasSpecial) {
        console.log(`  Q${idx+1} Opt ${letters[oIdx]} [Special]: ${opt}`);
      }
      if (opt.length > 70) {
        console.log(`  Q${idx+1} Opt ${letters[oIdx]} [Long, ${opt.length} chars]: ${opt}`);
      }
    });
  });
});
