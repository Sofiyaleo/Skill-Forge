const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge_db');
  console.log('Connected to MongoDB');

  const { topics, questions, getQuestionsByTopic } = require('../data/questions');
  const Assessment = require('../models/Assessment');

  console.log('\n=== CHECKING data/questions.js topics and questions ===');
  console.log(`Found ${topics.length} topics in data/questions.js.`);

  for (const topic of topics) {
    const topicQs = getQuestionsByTopic(topic.id);
    console.log(`\nTopic: ${topic.id} | Name: "${topic.name}" | Display: "${topic.display}" | Category: "${topic.category}"`);
    console.log(`  Questions count: ${topicQs.length}`);
    topicQs.forEach((q, idx) => {
      const qText = q.questionText || q.question;
      const opts = q.options || q.choices || q.answers;
      const optCount = opts ? opts.length : 0;
      let issues = [];
      if (!qText) issues.push('MISSING_QUESTION_TEXT');
      if (optCount !== 4) issues.push(`OPTION_COUNT_${optCount}_NOT_4`);
      if (opts) {
        opts.forEach((o, oIdx) => {
          if (o === null || o === undefined || o === '') issues.push(`EMPTY_OPT_${oIdx}`);
          if (typeof o === 'string' && o.trim() === '') issues.push(`BLANK_OPT_${oIdx}`);
        });
        const unique = new Set(opts.map(o => String(o).trim()));
        if (unique.size !== optCount) issues.push('DUPLICATE_OPTIONS');
      }
      if (typeof q.correctOptionIndex !== 'number' && typeof q.correctIndex !== 'number' && typeof q.correctAnswer !== 'number') {
        issues.push('MISSING_CORRECT_INDEX');
      }
      if (issues.length > 0) {
        console.log(`  ⚠️ Q${idx + 1}: "${qText ? qText.substring(0, 50) : 'NO TEXT'}" -> ISSUES: ${issues.join(', ')}`);
        console.log('     Options:', opts);
      } else {
        console.log(`  ✓ Q${idx + 1}: "${qText.substring(0, 40)}..." (Opts: ${opts.length}, Correct: ${q.correctIndex ?? q.correctOptionIndex})`);
      }
    });
  }

  console.log('\n=== CHECKING MongoDB assessments collection ===');
  const dbAssessments = await Assessment.find({});
  console.log(`Found ${dbAssessments.length} assessments in DB.`);

  for (const asmt of dbAssessments) {
    console.log(`\nDB Assessment: ${asmt.topic} | Title: "${asmt.title}" | Category: "${asmt.skillCategory}"`);
    console.log(`  Questions count: ${asmt.questions ? asmt.questions.length : 0}`);
    if (asmt.questions) {
      asmt.questions.forEach((q, idx) => {
        const qText = q.questionText || q.question;
        const opts = q.options || q.choices || q.answers;
        const optCount = opts ? opts.length : 0;
        let issues = [];
        if (!qText) issues.push('MISSING_QUESTION_TEXT');
        if (optCount !== 4) issues.push(`OPTION_COUNT_${optCount}_NOT_4`);
        if (opts) {
          opts.forEach((o, oIdx) => {
            if (o === null || o === undefined || o === '') issues.push(`EMPTY_OPT_${oIdx}`);
            if (typeof o === 'string' && o.trim() === '') issues.push(`BLANK_OPT_${oIdx}`);
          });
          const unique = new Set(opts.map(o => String(o).trim()));
          if (unique.size !== optCount) issues.push('DUPLICATE_OPTIONS');
        }
        if (typeof q.correctOptionIndex !== 'number' && typeof q.correctIndex !== 'number' && typeof q.correctAnswer !== 'number') {
          issues.push('MISSING_CORRECT_INDEX');
        }
        if (issues.length > 0) {
          console.log(`  ⚠️ Q${idx + 1}: "${qText ? qText.substring(0, 50) : 'NO TEXT'}" -> ISSUES: ${issues.join(', ')}`);
          console.log('     Options:', opts);
        }
      });
    }
  }

  // Check how careers in data/careers.js relate to assessments
  const { careers } = require('../data/careers');
  console.log('\n=== CHECKING CAREER SKILLS VS PRACTICE ASSESSMENTS ===');
  for (const career of careers) {
    console.log(`\nCareer: "${career.title}" (Category: ${career.category})`);
    career.requiredSkills.forEach(skill => {
      const sLower = skill.toLowerCase();
      const match = topics.find(t => 
        t.id.toLowerCase() === sLower ||
        t.name.toLowerCase() === sLower ||
        t.display.toLowerCase().includes(sLower) ||
        sLower.includes(t.name.toLowerCase()) ||
        sLower.includes(t.id.toLowerCase())
      );
      if (match) {
        console.log(`    ✓ Skill "${skill}" -> Assessment "${match.display}" (Category: ${match.category})`);
      } else {
        console.log(`    ❓ Skill "${skill}" -> No direct practice assessment mapped!`);
      }
    });
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
