const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge_db');
  const { topics, questions, getQuestionsByTopic } = require('../data/questions');
  const Assessment = require('../models/Assessment');

  console.log('=== CHECKING ALL QUESTIONS IN data/questions.js ===');
  for (const t of topics) {
    const qs = getQuestionsByTopic(t.id, false);
    console.log(`\n================= TOPIC: ${t.id} (${t.displayName || t.name}) [Category: ${t.skillCategory}] =================`);
    qs.forEach((q, idx) => {
      console.log(`Q${idx+1}: [${q.concept || 'NoConcept'}] "${q.question}"`);
      console.log(`   Correct Index: ${q.correctIndex} -> "${q.options[q.correctIndex]}"`);
      q.options.forEach((opt, oIdx) => {
        const letters = ['A', 'B', 'C', 'D'];
        console.log(`     ${letters[oIdx]}. "${opt}" (type: ${typeof opt}, length: ${opt ? opt.length : 0})`);
      });
      console.log(`   Explanation: "${q.explanation ? q.explanation.substring(0, 60) : 'NO_EXPL'}..."`);
    });
  }

  console.log('\n\n=== CHECKING ALL QUESTIONS IN MONGODB assessments COLLECTION ===');
  const dbAsmts = await Assessment.find({});
  for (const asmt of dbAsmts) {
    console.log(`\n================= DB TOPIC: ${asmt.topic} (${asmt.title}) [Category: ${asmt.skillCategory}] =================`);
    (asmt.questions || []).forEach((q, idx) => {
      console.log(`Q${idx+1}: [${q.concept || 'NoConcept'}] "${q.questionText || q.question}"`);
      console.log(`   Correct Option Index: ${q.correctOptionIndex} -> "${q.options ? q.options[q.correctOptionIndex] : 'NO_OPTS'}"`);
      (q.options || []).forEach((opt, oIdx) => {
        const letters = ['A', 'B', 'C', 'D'];
        console.log(`     ${letters[oIdx]}. "${opt}" (type: ${typeof opt}, length: ${opt ? opt.length : 0})`);
      });
    });
  }

  await mongoose.disconnect();
}

run().catch(console.error);
