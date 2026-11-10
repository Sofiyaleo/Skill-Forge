/**
 * controllers/careerController.js
 * Handles Career Roles catalog, Skill Gap Analysis algorithm,
 * and Personalized Learning Roadmaps with persistent task tracking.
 */

const CareerRole = require('../models/CareerRole');
const User = require('../models/User');
const Skill = require('../models/Skill');
const RoadmapTask = require('../models/RoadmapTask');
const Activity = require('../models/Activity');
const { getCareerById, careers } = require('../data/careers');
const { calculateSkillGap } = require('../services/skillGapService');
const { generateUserRoadmap } = require('../services/roadmapService');

/**
 * @desc    Get all career roles with category filter & keyword search
 * @route   GET /api/careers
 * @access  Public / Private
 */
exports.getAllRoles = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { 'requiredSkills.name': { $regex: s, $options: 'i' } }
      ];
    }

    let roles = await CareerRole.find(query).sort({ title: 1 });

    // Fallback to static catalog if DB hasn't been seeded yet
    if (roles.length === 0 && !search && (!category || category === 'All')) {
      roles = careers;
    }

    res.status(200).json({ success: true, count: roles.length, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve career roles.' });
  }
};

/**
 * @desc    Get single career role by ID or Title
 * @route   GET /api/careers/:id
 * @access  Public / Private
 */
exports.getRoleById = async (req, res) => {
  try {
    let role = await CareerRole.findById(req.params.id).catch(() => null);
    if (!role) {
      role = await CareerRole.findOne({
        $or: [
          { id: req.params.id },
          { title: { $regex: new RegExp(`^${req.params.id}$`, 'i') } }
        ]
      });
    }
    if (!role) {
      role = getCareerById(req.params.id);
    }
    if (!role) {
      return res.status(404).json({ success: false, message: 'Career role not found.' });
    }
    res.status(200).json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load career role.' });
  }
};

/**
 * @desc    Perform Skill Gap Analysis comparing Student Skills vs Career Role
 * @route   GET /api/careers/gap-analysis
 * @access  Private
 */
exports.analyzeSkillGap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const requestedRole = req.query.role || user.targetCareer || user.careerInterest || 'Full Stack Developer';
    
    // Look up career in database first, then fallback to catalog
    let career = await CareerRole.findOne({
      $or: [
        { title: { $regex: new RegExp(`^${requestedRole}$`, 'i') } },
        { id: requestedRole.toLowerCase().replace(/\s+/g, '-') }
      ]
    });

    if (!career) {
      career = getCareerById(requestedRole) || careers[0];
    }

    // Collect all student skills (merging Skill collection and User.skills)
    const dbSkills = await Skill.find({ user: user._id });
    const userSkills = user.skills || [];
    const skillMap = new Map();
    userSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    dbSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    const mergedStudentSkills = Array.from(skillMap.values());

    // Deterministic rule-based gap analysis
    const gap = calculateSkillGap(career, mergedStudentSkills);

    // Format comparison table for UI
    const comparisonTable = [
      ...gap.matchedSkills.map(s => ({
        name: s.name,
        yourLevel: s.currentProficiency,
        yourRank: s.currentRank,
        requiredLevel: s.requiredProficiency,
        requiredRank: s.requiredRank,
        status: 'Matched',
        statusClass: 'success',
        importance: s.importance
      })),
      ...gap.needsImprovementSkills.map(s => ({
        name: s.name,
        yourLevel: s.currentProficiency,
        yourRank: s.currentRank,
        requiredLevel: s.requiredProficiency,
        requiredRank: s.requiredRank,
        status: 'Needs Improvement',
        statusClass: 'warning',
        importance: s.importance
      })),
      ...gap.missingSkills.map(s => ({
        name: s.name,
        yourLevel: 'Not Added',
        yourRank: 0,
        requiredLevel: s.requiredProficiency,
        requiredRank: s.requiredRank,
        status: 'Missing',
        statusClass: 'danger',
        importance: s.importance
      }))
    ];

    // Get list of all available roles for the dropdown selector
    let allRoles = await CareerRole.find().select('title category id');
    if (allRoles.length === 0) {
      allRoles = careers.map(c => ({ title: c.title, category: c.category, id: c.id }));
    }

    res.status(200).json({
      success: true,
      selectedRole: career.title,
      overallReadiness: gap.matchPercentage,
      calculationFormula: `Readiness = (${gap.matchedCount} matched skills / ${gap.totalRequired} required skills) × 100 = ${gap.matchPercentage}%`,
      counts: {
        meets: gap.matchedCount,
        improve: gap.needsImprovementCount,
        missing: gap.missingCount,
        totalRequired: gap.totalRequired
      },
      comparisonTable,
      missingSkills: gap.missingSkills.map(s => s.name),
      needsImprovementSkills: gap.needsImprovementSkills.map(s => s.name),
      suggestedNextSteps: gap.suggestedNextSteps,
      allRoles
    });
  } catch (error) {
    console.error('Gap Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute skill gap analysis.' });
  }
};

/**
 * @desc    Get Personalized Roadmap with persistent tasks from MongoDB
 * @route   GET /api/careers/roadmap
 * @access  Private
 */
exports.getRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const roleTitle = req.query.role || user.targetCareer || user.careerInterest || 'Full Stack Developer';

    let tasks = await RoadmapTask.find({ user: user._id }).sort({ sequence: 1, createdAt: 1 });

    // If student has no roadmap tasks yet, generate them automatically!
    if (tasks.length === 0) {
      const generated = await generateUserRoadmap(user._id, roleTitle);
      tasks = generated.tasks;
    }

    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
    const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
    const notStartedCount = tasks.filter(t => t.status === 'Not Started').length;
    const completionPercentage = totalTasks > 0
      ? Math.round((completedTasksCount / totalTasks) * 100)
      : 0;

    // Group tasks into structured phases (Phases 1 through 5)
    const phaseOrder = [
      'Phase 1 — Foundation',
      'Phase 2 — Core Technical Skills',
      'Phase 3 — Practical Projects',
      'Phase 4 — Advanced Practice',
      'Phase 5 — Portfolio and Career Preparation'
    ];

    const phaseMap = new Map();
    phaseOrder.forEach(p => phaseMap.set(p, []));

    tasks.forEach(t => {
      const p = t.phase || (t.priority === 'High' ? 'Phase 1 — Foundation' : 'Phase 2 — Core Technical Skills');
      if (!phaseMap.has(p)) {
        phaseMap.set(p, []);
      }
      phaseMap.get(p).push({
        taskId: t._id.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        reason: t.reason,
        whyItMatters: t.whyItMatters || t.reason || `Essential mastery required for ${roleTitle}`,
        whatToLearn: t.whatToLearn && t.whatToLearn.length > 0 ? t.whatToLearn : [t.title, 'Syntax & Core Concepts', 'Architecture Best Practices'],
        whatToPractice: t.whatToPractice && t.whatToPractice.length > 0 ? t.whatToPractice : ['Implement practical exercises', 'Test edge cases'],
        deliverable: t.deliverable || 'Working code deliverable demonstrating verified skill competency',
        completionCriteria: t.completionCriteria || 'Code passes with 0 errors and adheres to industry standards',
        estimatedEffort: t.estimatedEffort || '10 - 15 hours',
        learningResources: t.learningResources || [],
        targetDate: t.targetDate
      });
    });

    const roadmapSteps = [];
    let stepCounter = 1;
    for (const [phaseTitle, phaseTasks] of phaseMap.entries()) {
      if (phaseTasks.length > 0) {
        roadmapSteps.push({
          stepOrder: stepCounter++,
          weekTitle: phaseTitle,
          tasks: phaseTasks
        });
      }
    }

    if (roadmapSteps.length === 0 && tasks.length > 0) {
      roadmapSteps.push({
        stepOrder: 1,
        weekTitle: 'Recommended Learning Milestones',
        tasks: tasks.map(t => ({
          taskId: t._id.toString(),
          title: t.title,
          description: t.description,
          priority: t.priority || 'Medium',
          status: t.status,
          reason: t.reason,
          whyItMatters: t.whyItMatters || t.reason,
          whatToLearn: t.whatToLearn || [],
          whatToPractice: t.whatToPractice || [],
          deliverable: t.deliverable || 'Practical working deliverable',
          completionCriteria: t.completionCriteria || 'Successfully verified',
          estimatedEffort: t.estimatedEffort || '10 - 12 hours',
          learningResources: t.learningResources || []
        }))
      });
    }

    // Career role overview & gap summary for roadmap header
    const careerObj = getCareerById(roleTitle) || careers[0];
    const userSkills = user.skills || [];
    const dbSkills = await Skill.find({ user: user._id });
    const skillMap = new Map();
    userSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    dbSkills.forEach(s => skillMap.set((s.normalizedName || s.name).toLowerCase(), s));
    const allSkills = Array.from(skillMap.values());
    const gap = calculateSkillGap(careerObj, allSkills);

    const roleInfo = {
      title: careerObj.title,
      description: careerObj.description,
      averageSalary: careerObj.averageSalary || '₹6 - 12 LPA',
      requiredSkills: (careerObj.requiredSkills || []).map(s => 
        typeof s === 'string' 
          ? { name: s, minProficiency: 'Intermediate' } 
          : { name: s.name, minProficiency: s.minProficiency || 'Intermediate', category: s.category || '', importance: s.importance || 'High' }
      ),
      readinessPercentage: gap.matchPercentage,
      matchedCount: gap.matchedCount,
      totalRequired: gap.totalRequired,
      missingSkills: gap.missingSkills.map(s => s.name),
      needsImprovementSkills: gap.needsImprovementSkills.map(s => s.name)
    };

    let allRoles = await CareerRole.find().select('title id');
    if (allRoles.length === 0) {
      allRoles = careers.map(c => ({ title: c.title, id: c.id }));
    }

    res.status(200).json({
      success: true,
      roleTitle,
      roleInfo,
      totalTasks,
      completedTasksCount,
      inProgressCount,
      notStartedCount,
      completionPercentage,
      tasks,
      roadmapSteps,
      allRoles
    });
  } catch (error) {
    console.error('Roadmap Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load learning roadmap.' });
  }
};

/**
 * @desc    Regenerate / refresh roadmap recommendations from current skill gaps
 * @route   POST /api/careers/roadmap/generate
 * @access  Private
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const roleTitle = req.body.role || user.targetCareer || user.careerInterest || 'Full Stack Developer';

    const result = await generateUserRoadmap(user._id, roleTitle);

    res.status(200).json({
      success: true,
      message: result.createdCount > 0
        ? `Generated ${result.createdCount} personalized roadmap task(s) for ${result.careerTitle}!`
        : 'Your roadmap is already up to date with all identified skill gaps.',
      ...result
    });
  } catch (error) {
    console.error('Generate Roadmap Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate roadmap recommendations.' });
  }
};

/**
 * @desc    Toggle task completion / status in student roadmap
 * @route   POST /api/careers/roadmap/toggle-task
 * @access  Private
 */
exports.toggleRoadmapTask = async (req, res) => {
  try {
    const { taskId, status } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required.' });
    }

    const task = await RoadmapTask.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    if (status) {
      task.status = status;
    } else {
      // Toggle
      task.status = task.status === 'Completed' ? 'Not Started' : 'Completed';
    }

    await task.save();

    // Log activity if completed
    if (task.status === 'Completed') {
      await Activity.create({
        user: req.user.id,
        text: `Completed roadmap milestone: '${task.title}'`,
        icon: 'bi-check-circle-fill',
        color: '#10B981'
      });
    }

    const totalTasks = await RoadmapTask.countDocuments({ user: req.user.id });
    const completedCount = await RoadmapTask.countDocuments({ user: req.user.id, status: 'Completed' });
    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      message: `Task status updated to "${task.status}".`,
      task,
      completedCount,
      percentage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task progress.' });
  }
};

/**
 * @desc    Select a career as the student's target career
 * @route   POST /api/careers/select-target
 * @access  Private
 */
exports.selectTargetCareer = async (req, res) => {
  try {
    const { roleTitle } = req.body;
    if (!roleTitle || !roleTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Career role title is required.' });
    }

    const user = await User.findById(req.user.id);
    user.targetCareer = roleTitle.trim();
    user.careerInterest = roleTitle.trim();
    await user.save();

    // Generate roadmap for newly selected career
    const roadmapResult = await generateUserRoadmap(user._id, user.targetCareer);

    // Log activity
    await Activity.create({
      user: user._id,
      text: `Selected target career: ${user.targetCareer}`,
      icon: 'bi-compass',
      color: '#059669'
    });

    res.status(200).json({
      success: true,
      message: `Target career saved: ${user.targetCareer}! Learning roadmap refreshed.`,
      targetCareer: user.targetCareer,
      roadmapResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set target career.' });
  }
};
