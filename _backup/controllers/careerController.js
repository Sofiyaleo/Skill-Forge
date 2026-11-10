/**
 * controllers/careerController.js
 * Handles Career Roles catalog, Skill Gap Analysis algorithm,
 * and Personalized Learning Roadmaps with persistent task tracking.
 */

const CareerRole = require('../models/CareerRole');
const User = require('../models/User');
const UserRoadmap = require('../models/UserRoadmap');

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
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'requiredSkills.name': { $regex: search, $options: 'i' } }
      ];
    }

    const roles = await CareerRole.find(query).sort({ title: 1 });
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
    let role = await CareerRole.findById(req.params.id);
    if (!role) {
      role = await CareerRole.findOne({ title: req.params.id });
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
    const roleTitle = req.query.role || user.careerInterest || 'Web Developer';

    const role = await CareerRole.findOne({ title: roleTitle });
    if (!role) {
      return res.status(404).json({ success: false, message: `Career role '${roleTitle}' not found.` });
    }

    // Comparison logic
    let meetsCount = 0;
    let improveCount = 0;
    let missingCount = 0;
    const comparisonTable = [];
    const missingSkills = [];

    let totalPointsEarned = 0;
    let totalPointsPossible = 0;

    role.requiredSkills.forEach(reqSkill => {
      const targetLevel = reqSkill.requiredLevel;
      totalPointsPossible += targetLevel;

      // Find user's level for this skill
      const userSkill = user.skills.find(
        s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
      );

      const yourLevel = userSkill ? userSkill.rating : 0;

      let status = 'Missing';
      if (!userSkill || yourLevel === 0) {
        status = 'Missing';
        missingCount++;
        missingSkills.push(reqSkill.name);
      } else if (yourLevel >= targetLevel) {
        status = 'Meets';
        meetsCount++;
        totalPointsEarned += targetLevel;
      } else {
        status = 'Improve';
        improveCount++;
        totalPointsEarned += yourLevel;
      }

      comparisonTable.push({
        name: reqSkill.name,
        yourLevel: yourLevel ? `${yourLevel}/5` : '0/5',
        requiredLevel: `${targetLevel}/5`,
        status,
        importance: reqSkill.importance
      });
    });

    const overallReadiness = totalPointsPossible > 0
      ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
      : 0;

    // Get list of all available roles for the dropdown selector
    const allRoles = await CareerRole.find().select('title category');

    res.status(200).json({
      success: true,
      selectedRole: role.title,
      overallReadiness,
      counts: {
        meets: meetsCount,
        improve: improveCount,
        missing: missingCount
      },
      comparisonTable,
      missingSkills,
      allRoles
    });
  } catch (error) {
    console.error('Gap Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute skill gap analysis.' });
  }
};

/**
 * @desc    Get Personalized Roadmap with persistent completion checkboxes
 * @route   GET /api/careers/roadmap
 * @access  Private
 */
exports.getRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const roleTitle = req.query.role || user.careerInterest || 'Web Developer';

    const role = await CareerRole.findOne({ title: roleTitle });
    if (!role) {
      return res.status(404).json({ success: false, message: `Role '${roleTitle}' not found.` });
    }

    // Retrieve or initialize user roadmap tracker
    let userRoadmap = await UserRoadmap.findOne({ user: user._id, roleTitle: role.title });
    if (!userRoadmap) {
      userRoadmap = await UserRoadmap.create({
        user: user._id,
        roleTitle: role.title,
        completedTaskIds: []
      });
    }

    // Calculate total tasks and completed tasks
    let totalTasks = 0;
    let completedTasksCount = 0;

    const populatedRoadmap = role.roadmapSteps.map(step => {
      const tasksWithStatus = step.tasks.map(task => {
        totalTasks++;
        const isCompleted = userRoadmap.completedTaskIds.includes(task.taskId);
        if (isCompleted) completedTasksCount++;

        return {
          taskId: task.taskId,
          title: task.title,
          description: task.description,
          resourceLink: task.resourceLink,
          status: isCompleted ? 'Completed' : task.defaultStatus || 'To Do'
        };
      });

      return {
        stepOrder: step.stepOrder,
        weekTitle: step.weekTitle,
        tasks: tasksWithStatus
      };
    });

    const completionPercentage = totalTasks > 0
      ? Math.round((completedTasksCount / totalTasks) * 100)
      : 0;

    const allRoles = await CareerRole.find().select('title');

    res.status(200).json({
      success: true,
      roleTitle: role.title,
      totalTasks,
      completedTasksCount,
      completionPercentage,
      roadmapSteps: populatedRoadmap,
      allRoles
    });
  } catch (error) {
    console.error('Roadmap Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load learning roadmap.' });
  }
};

/**
 * @desc    Toggle task completion in student roadmap
 * @route   POST /api/careers/roadmap/toggle-task
 * @access  Private
 */
exports.toggleRoadmapTask = async (req, res) => {
  try {
    const { taskId, roleTitle } = req.body;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required.' });
    }

    let userRoadmap = await UserRoadmap.findOne({ user: req.user.id, roleTitle });
    if (!userRoadmap) {
      userRoadmap = await UserRoadmap.create({
        user: req.user.id,
        roleTitle,
        completedTaskIds: []
      });
    }

    const taskIndex = userRoadmap.completedTaskIds.indexOf(taskId);
    let isNowCompleted = false;

    if (taskIndex > -1) {
      // Uncheck
      userRoadmap.completedTaskIds.splice(taskIndex, 1);
      isNowCompleted = false;
    } else {
      // Check
      userRoadmap.completedTaskIds.push(taskId);
      isNowCompleted = true;
    }

    userRoadmap.updatedAt = new Date();
    await userRoadmap.save();

    res.status(200).json({
      success: true,
      message: isNowCompleted ? 'Task marked as completed.' : 'Task marked as to-do.',
      isCompleted: isNowCompleted,
      completedCount: userRoadmap.completedTaskIds.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task progress.' });
  }
};
