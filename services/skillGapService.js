const { PROFICIENCY_RANKS, getCareerById } = require('../data/careers');

/**
 * Skill Gap Analysis Service
 * Evaluates student skills against career standards using deterministic rule-based comparison.
 */

// Normalization & synonym dictionary
const synonymMap = {
  'html': 'html5',
  'html5': 'html5',
  'css': 'css3',
  'css3': 'css3',
  'js': 'javascript',
  'javascript': 'javascript',
  'ecmascript': 'javascript',
  'node': 'node.js',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'express': 'express.js',
  'expressjs': 'express.js',
  'express.js': 'express.js',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'git': 'git & github',
  'github': 'git & github',
  'git & github': 'git & github',
  'rest': 'rest apis',
  'rest api': 'rest apis',
  'rest apis': 'rest apis',
  'restful apis': 'rest apis',
  'responsive design': 'responsive web design',
  'responsive web design': 'responsive web design',
  'dsa': 'data structures & algorithms',
  'data structures': 'data structures & algorithms',
  'data structures & algorithms': 'data structures & algorithms',
  'oop': 'object-oriented programming',
  'object oriented programming': 'object-oriented programming',
  'object-oriented programming': 'object-oriented programming',
  'ui/ux': 'ui/ux design',
  'ui ux': 'ui/ux design',
  'ui/ux design': 'ui/ux design'
};

function normalizeSkillName(name) {
  if (!name) return '';
  const cleaned = name.trim().toLowerCase();
  return synonymMap[cleaned] || cleaned;
}

/**
 * Performs skill gap analysis for a given career and set of user skills.
 * @param {Object|String} careerInput - Career object or career identifier string
 * @param {Array} userSkills - Array of Mongoose skill documents or plain skill objects
 * @returns {Object} Gap analysis breakdown and metrics
 */
function calculateSkillGap(careerInput, userSkills = []) {
  const career = typeof careerInput === 'string' ? getCareerById(careerInput) : careerInput;

  if (!career || !career.requiredSkills || career.requiredSkills.length === 0) {
    return {
      career: career || null,
      totalRequired: 0,
      matchedCount: 0,
      needsImprovementCount: 0,
      missingCount: 0,
      matchPercentage: 0,
      matchedSkills: [],
      needsImprovementSkills: [],
      missingSkills: [],
      suggestedNextSteps: ['Select a valid career path to view skill gap analysis.']
    };
  }

  // Create a normalized lookup map of user's skills
  const userSkillMap = new Map();
  userSkills.forEach(skill => {
    const canonicalKey = normalizeSkillName(skill.normalizedName || skill.name);
    // Keep highest proficiency if user added duplicate/synonym
    const existing = userSkillMap.get(canonicalKey);
    const currentRank = PROFICIENCY_RANKS[skill.proficiency] || skill.rating || 1;
    const existingRank = existing ? (PROFICIENCY_RANKS[existing.proficiency] || existing.rating || 1) : 0;
    if (!existing || currentRank > existingRank) {
      userSkillMap.set(canonicalKey, skill);
    }
  });

  const matchedSkills = [];
  const needsImprovementSkills = [];
  const missingSkills = [];

  career.requiredSkills.forEach(req => {
    const canonicalReqKey = normalizeSkillName(req.name);
    const userMatch = userSkillMap.get(canonicalReqKey);
    const reqRank = PROFICIENCY_RANKS[req.minProficiency] || req.requiredLevel || 1;
    const reqProf = req.minProficiency || (['Beginner','Basic','Intermediate','Advanced','Expert'][reqRank-1] || 'Intermediate');

    if (!userMatch) {
      missingSkills.push({
        name: req.name,
        category: req.category || 'Other',
        requiredProficiency: reqProf,
        requiredRank: reqRank,
        importance: req.importance || 'Medium',
        status: 'Missing',
        statusClass: 'danger',
        notes: 'Skill not currently recorded in your profile.'
      });
    } else {
      const userRank = PROFICIENCY_RANKS[userMatch.proficiency] || userMatch.rating || 1;
      const userProf = userMatch.proficiency || (['Beginner','Basic','Intermediate','Advanced','Expert'][userRank-1] || 'Intermediate');

      if (userRank >= reqRank) {
        matchedSkills.push({
          name: req.name,
          category: req.category || 'Other',
          requiredProficiency: reqProf,
          currentProficiency: userProf,
          requiredRank: reqRank,
          currentRank: userRank,
          importance: req.importance || 'Medium',
          status: 'Matched',
          statusClass: 'success',
          notes: 'Meets or exceeds career benchmark.'
        });
      } else {
        needsImprovementSkills.push({
          name: req.name,
          category: req.category || 'Other',
          requiredProficiency: reqProf,
          currentProficiency: userProf,
          requiredRank: reqRank,
          currentRank: userRank,
          rankGap: reqRank - userRank,
          importance: req.importance || 'Medium',
          status: 'Needs Improvement',
          statusClass: 'warning',
          notes: `Current level (${userProf}) is below recommended (${reqProf}).`
        });
      }
    }
  });

  const totalRequired = career.requiredSkills.length;
  const matchedCount = matchedSkills.length;
  const needsImprovementCount = needsImprovementSkills.length;
  const missingCount = missingSkills.length;

  // Formula: (Matched / Total) * 100
  const matchPercentage = totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : 0;

  // Generate suggested next steps
  const suggestedNextSteps = [];
  if (missingSkills.length > 0) {
    const highPriorityMissing = missingSkills.filter(s => s.importance === 'High').map(s => s.name);
    if (highPriorityMissing.length > 0) {
      suggestedNextSteps.push(`Focus on acquiring core missing competencies: ${highPriorityMissing.slice(0, 3).join(', ')}.`);
    } else {
      suggestedNextSteps.push(`Begin by learning foundational missing skills such as ${missingSkills[0].name}.`);
    }
  }

  if (needsImprovementSkills.length > 0) {
    suggestedNextSteps.push(`Level up your existing proficiency in ${needsImprovementSkills.map(s => s.name).slice(0, 2).join(' and ')}.`);
  }

  if (matchPercentage >= 80) {
    suggestedNextSteps.push('Your skill profile strongly aligns with this career! Consider building advanced portfolio projects and certifications.');
  } else if (matchPercentage >= 50) {
    suggestedNextSteps.push('Good foundation! Generate personalized roadmap tasks to bridge remaining skill gaps systematically.');
  } else {
    suggestedNextSteps.push('Follow the structured learning roadmap to build your foundational abilities step by step.');
  }

  return {
    career,
    totalRequired,
    matchedCount,
    needsImprovementCount,
    missingCount,
    matchPercentage,
    matchedSkills,
    needsImprovementSkills,
    missingSkills,
    suggestedNextSteps
  };
}

module.exports = {
  calculateSkillGap,
  normalizeSkillName
};
