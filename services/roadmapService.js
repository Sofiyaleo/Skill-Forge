/**
 * services/roadmapService.js
 * Rule-based Personalized Learning Roadmap Generator.
 * Derives milestones and prioritized tasks from actual skill gaps.
 */

const RoadmapTask = require('../models/RoadmapTask');
const Skill = require('../models/Skill');
const User = require('../models/User');
const CareerRole = require('../models/CareerRole');
const CareerRoadmap = require('../models/CareerRoadmap');
const { getCareerById, careers } = require('../data/careers');
const { calculateSkillGap } = require('./skillGapService');
const { getRecommendationForSkill } = require('../data/learningResources');

/**
 * Generate or refresh personalized roadmap tasks for a user
 * @param {String|ObjectId} userId
 * @param {String} [targetRoleTitle]
 * @returns {Promise<Object>} Summary of generated tasks and current roadmap stats
 */
async function generateUserRoadmap(userId, targetRoleTitle) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Collect skills from both Skill collection and User.skills
  const dbSkills = await Skill.find({ user: userId });
  const userEmbeddedSkills = user.skills || [];
  
  // Merge skills prioritizing Skill model
  const skillMap = new Map();
  userEmbeddedSkills.forEach(s => skillMap.set(s.name.toLowerCase(), s));
  dbSkills.forEach(s => skillMap.set(s.name.toLowerCase(), s));
  const mergedSkills = Array.from(skillMap.values());

  const roleTitle = targetRoleTitle || user.targetCareer || user.careerInterest || 'Full Stack Developer';
  let career = await CareerRole.findOne({
    $or: [
      { title: { $regex: new RegExp(`^${roleTitle}$`, 'i') } },
      { id: roleTitle.toLowerCase().replace(/\s+/g, '-') }
    ]
  });
  if (!career) {
    career = getCareerById(roleTitle) || careers[0];
  }

  const gap = calculateSkillGap(career, mergedSkills);

  // Fetch existing tasks to prevent duplicates and preserve student completed progress
  const existingTasks = await RoadmapTask.find({ user: userId });
  const existingSources = new Set(
    existingTasks.map(t => (t.sourceSkill ? t.sourceSkill.toLowerCase() : t.title.toLowerCase()))
  );

  let createdCount = 0;
  let sequenceTracker = existingTasks.length + 1;
  const newTasksToInsert = [];

  // Check if admin defined a custom CareerRoadmap in MongoDB for this career
  const customRoadmap = await CareerRoadmap.findOne({
    $or: [
      { careerTitle: { $regex: new RegExp(`^${roleTitle}$`, 'i') } },
      { careerRole: roleTitle.toLowerCase().replace(/\s+/g, '-') }
    ]
  });

  if (customRoadmap && customRoadmap.phases && customRoadmap.phases.length > 0) {
    for (const ph of customRoadmap.phases) {
      for (const tk of ph.tasks) {
        const sourceKey = (tk.title || '').toLowerCase();
        if (!existingSources.has(sourceKey)) {
          newTasksToInsert.push({
            user: userId,
            title: tk.title,
            description: tk.instructions || tk.title,
            reason: `Milestone for ${career.title}`,
            priority: 'High',
            phase: ph.phaseName,
            whyItMatters: `Structured phase milestone for ${career.title}.`,
            whatToLearn: [tk.title, 'Fundamental theory and tools'],
            whatToPractice: ['Build working exercise', 'Test edge cases'],
            deliverable: 'Working milestone component or code deliverable',
            completionCriteria: 'Passes test requirements and functions accurately',
            estimatedEffort: tk.estimatedEffort || '10 - 15 hours',
            learningResources: tk.learningResources || [],
            sequence: sequenceTracker++,
            targetDate: new Date(Date.now() + 14 * 86400000),
            status: 'Not Started',
            sourceSkill: tk.title
          });
          existingSources.add(sourceKey);
          createdCount++;
        }
      }
    }
  }

  // 1. Missing Skills -> High Priority Tasks
  for (const item of gap.missingSkills) {
    const sourceKey = item.name.toLowerCase();
    if (!existingSources.has(sourceKey)) {
      const rec = getRecommendationForSkill(
        item.name,
        career.title,
        'Missing',
        item.requiredProficiency,
        'None'
      );

      newTasksToInsert.push({
        user: userId,
        title: rec.title,
        description: rec.description,
        reason: rec.reason || `Essential requirement for ${career.title}`,
        priority: 'High',
        phase: rec.phase || 'Phase 1 — Foundation',
        whyItMatters: rec.whyItMatters || `Mastering this is vital for succeeding as a ${career.title}.`,
        whatToLearn: rec.whatToLearn || [],
        whatToPractice: rec.whatToPractice || [],
        deliverable: rec.deliverable || `Working code component demonstrating practical mastery of ${item.name}.`,
        completionCriteria: rec.completionCriteria || `Achieve verified competence and pass the relevant assessment with 70%+ score.`,
        estimatedEffort: rec.estimatedEffort || '12 - 16 hours',
        learningResources: rec.learningResources || [],
        sequence: sequenceTracker++,
        targetDate: rec.targetDate || new Date(Date.now() + 14 * 86400000),
        status: 'Not Started',
        sourceSkill: item.name
      });

      existingSources.add(sourceKey);
      createdCount++;
    }
  }

  // 2. Needs Improvement Skills -> Medium Priority Tasks
  for (const item of gap.needsImprovementSkills) {
    const sourceKey = item.name.toLowerCase();
    if (!existingSources.has(sourceKey)) {
      const rec = getRecommendationForSkill(
        item.name,
        career.title,
        'Needs Improvement',
        item.requiredProficiency,
        item.currentProficiency
      );

      newTasksToInsert.push({
        user: userId,
        title: rec.title,
        description: rec.description,
        reason: rec.reason || `Upgrade proficiency from ${item.currentProficiency} to ${item.requiredProficiency}`,
        priority: rec.priority || 'Medium',
        phase: rec.phase || 'Phase 2 — Core Technical Skills',
        whyItMatters: rec.whyItMatters || `Upgrading proficiency in this skill directly increases your market readiness for ${career.title}.`,
        whatToLearn: rec.whatToLearn || [],
        whatToPractice: rec.whatToPractice || [],
        deliverable: rec.deliverable || `Refactored component adhering to enterprise design patterns in ${item.name}.`,
        completionCriteria: rec.completionCriteria || `Code executes with zero errors and meets industry performance guidelines.`,
        estimatedEffort: rec.estimatedEffort || '10 - 14 hours',
        learningResources: rec.learningResources || [],
        sequence: sequenceTracker++,
        targetDate: rec.targetDate || new Date(Date.now() + 10 * 86400000),
        status: 'Not Started',
        sourceSkill: item.name
      });

      existingSources.add(sourceKey);
      createdCount++;
    }
  }

  // 3. Ensure Phase 3 (Project) and Phase 5 (Career Prep) milestones exist if not already present
  const capstoneKey = `capstone_${career.title.toLowerCase().replace(/\s+/g, '_')}`;
  if (!existingSources.has(capstoneKey) && !existingSources.has('capstone')) {
    newTasksToInsert.push({
      user: userId,
      title: `Build End-to-End ${career.title} Portfolio Project`,
      description: `Architect and deploy a full-scale portfolio project implementing the core skills required for ${career.title}.`,
      reason: `Demonstrates verified hands-on competence to campus recruiters and technical interviewers.`,
      priority: 'High',
      phase: 'Phase 3 — Practical Projects',
      whyItMatters: `Recruiters prioritize candidates with working, deployed applications over theoretical knowledge alone.`,
      whatToLearn: [
        `Architectural patterns for production applications in ${career.title}`,
        `Clean code structure, error handling, and environment isolation`,
        `Hosting and deploying on modern cloud platforms (Vercel, Render, AWS)`
      ],
      whatToPractice: [
        `Plan user stories and database schemas before writing implementation code`,
        `Implement full CRUD features with client and server-side validation`,
        `Write automated unit or integration tests verifying business logic`
      ],
      deliverable: `Working, deployed application with public GitHub repository and live demo URL.`,
      completionCriteria: `Project is linked in your SkillForge Portfolio and displays correctly on desktop and mobile.`,
      estimatedEffort: '25 - 35 hours',
      learningResources: [
        { title: 'Full Stack Architecture Patterns', url: 'https://github.com' }
      ],
      sequence: sequenceTracker++,
      targetDate: new Date(Date.now() + 25 * 86400000),
      status: 'Not Started',
      sourceSkill: 'Capstone'
    });
    existingSources.add('capstone');
    createdCount++;
  }

  const prepKey = `prep_${career.title.toLowerCase().replace(/\s+/g, '_')}`;
  if (!existingSources.has(prepKey) && !existingSources.has('interview_prep')) {
    newTasksToInsert.push({
      user: userId,
      title: `Resume Polish & Technical Interview Preparation`,
      description: `Integrate your verified skills, projects, and achievements into the SkillForge Resume Builder and practice technical interview questions.`,
      reason: `Final stage preparation for campus placements and technical evaluations.`,
      priority: 'Medium',
      phase: 'Phase 5 — Portfolio and Career Preparation',
      whyItMatters: `A clear, ATS-friendly resume backed by demonstrable project stories ensures you clear recruiter screenings.`,
      whatToLearn: [
        `STAR technique (Situation, Task, Action, Result) for explaining technical projects`,
        `Formatting skills and achievements concisely for automated applicant screening`,
        `Explaining technical trade-offs made during project development`
      ],
      whatToPractice: [
        `Review technical assessment questions on SkillForge`,
        `Conduct a mock technical interview answering questions about your portfolio projects`
      ],
      deliverable: `Finalized A4 PDF resume generated from SkillForge with verified achievements and portfolio links.`,
      completionCriteria: `Resume is reviewed, formatted cleanly with no missing fields, and downloaded as PDF.`,
      estimatedEffort: '8 - 12 hours',
      learningResources: [
        { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org' }
      ],
      sequence: sequenceTracker++,
      targetDate: new Date(Date.now() + 30 * 86400000),
      status: 'Not Started',
      sourceSkill: 'interview_prep'
    });
    existingSources.add('interview_prep');
    createdCount++;
  }

  if (newTasksToInsert.length > 0) {
    await RoadmapTask.insertMany(newTasksToInsert);
  }

  // Fetch updated task list
  const allTasks = await RoadmapTask.find({ user: userId }).sort({ sequence: 1, createdAt: 1 });
  const totalTasks = allTasks.length;
  const completedCount = allTasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = allTasks.filter(t => t.status === 'In Progress').length;
  const notStartedCount = allTasks.filter(t => t.status === 'Not Started').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    careerTitle: career.title,
    createdCount,
    totalTasks,
    completedCount,
    inProgressCount,
    notStartedCount,
    completionPercentage,
    tasks: allTasks
  };
}

module.exports = {
  generateUserRoadmap,
  generateRoadmap: generateUserRoadmap
};
