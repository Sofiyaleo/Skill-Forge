/**
 * controllers/adminController.js
 * Administrative control panel logic:
 * - Platform analytics & KPIs (Actual MongoDB data)
 * - Student management (Enrolled students list, profile & progress view, safe deletion)
 * - Skills repository CRUD (Add, Edit, Delete, View platform skills with MongoDB persistence)
 * - Career Role catalog CRUD (Add, Edit, Delete, View careers and required skill benchmarks)
 * - Assessment & Quiz CRUD (Add, Edit, Delete assessments and MCQ questions)
 * - Learning Roadmap CRUD (Create, Edit, Delete career roadmaps with phases and tasks, preserving student progress)
 * - Reports and Analytics (Student totals, test participation, roadmap progress, skill distributions)
 * - Admin Profile (View & update permitted admin details in MongoDB)
 */

const User = require('../models/User');
const GlobalSkill = require('../models/GlobalSkill');
const Skill = require('../models/Skill');
const CareerRole = require('../models/CareerRole');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const RoadmapTask = require('../models/RoadmapTask');
const UserRoadmap = require('../models/UserRoadmap');
const CareerRoadmap = require('../models/CareerRoadmap');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const { normalizeSkillKey } = require('../data/entranceQuestions');
const { topics, getQuestionsByTopic } = require('../data/questions');
const { careers } = require('../data/careers');

// Default initial skills to seed into GlobalSkill catalog if empty
const DEFAULT_PLATFORM_SKILLS = [
  { name: 'JavaScript', category: 'Programming', description: 'Core ES6+, asynchronous programming, event loop, and DOM manipulation.' },
  { name: 'HTML5', category: 'Web Development', description: 'Semantic markup, accessibility (a11y), forms, and responsive elements.' },
  { name: 'CSS3', category: 'Web Development', description: 'Flexbox, CSS Grid, media queries, animations, and custom properties.' },
  { name: 'React', category: 'Frontend', description: 'Component architecture, hooks, state management, and virtual DOM.' },
  { name: 'Node.js', category: 'Backend', description: 'Event-driven server runtime, filesystem, streams, and npm ecosystem.' },
  { name: 'Express.js', category: 'Backend', description: 'Middleware pipelines, routing, REST API design, and authentication.' },
  { name: 'MongoDB', category: 'Database', description: 'Document schemas, Mongoose ODM, indexing, and aggregation pipelines.' },
  { name: 'SQL', category: 'Database', description: 'Relational table design, joins, indexing, normalization, and ACID transactions.' },
  { name: 'Python', category: 'Programming', description: 'Data structures, OOP, scripting, automation, and libraries.' },
  { name: 'Git & GitHub', category: 'Tools and Platforms', description: 'Version control, branching workflows, pull requests, and merge strategies.' },
  { name: 'Docker', category: 'DevOps', description: 'Containerization, Dockerfiles, volume binding, and multi-container setups.' },
  { name: 'REST APIs', category: 'Backend', description: 'HTTP verbs, status codes, payload structures, pagination, and API security.' },
  { name: 'Data Structures', category: 'Core CS', description: 'Arrays, linked lists, trees, graphs, sorting, and Big-O algorithmic complexity.' },
  { name: 'TypeScript', category: 'Programming', description: 'Static typing, interfaces, generics, and compiler configurations.' },
  { name: 'AWS Cloud', category: 'DevOps', description: 'EC2, S3, IAM policies, and cloud infrastructure deployment.' },
  { name: 'UI/UX Design', category: 'Design', description: 'User-centered design principles, wireframing, typography, and visual hierarchy.' }
];

/**
 * @desc    Get system-wide platform statistics using actual database data
 * @route   GET /api/admin/stats
 * @access  Private (Admin Only)
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRoles = await CareerRole.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalTestsTaken = await AssessmentResult.countDocuments();

    // Ensure GlobalSkill has baseline records
    let totalSkills = await GlobalSkill.countDocuments();
    if (totalSkills === 0) {
      for (const sk of DEFAULT_PLATFORM_SKILLS) {
        try {
          await GlobalSkill.create(sk);
        } catch (e) {
          // ignore duplicate
        }
      }
      totalSkills = await GlobalSkill.countDocuments();
    }

    // Learning Roadmaps count (custom career roadmaps + active student roadmaps)
    const customRoadmapsCount = await CareerRoadmap.countDocuments();
    const activeStudentRoadmaps = await UserRoadmap.countDocuments();
    const totalRoadmaps = Math.max(customRoadmapsCount, activeStudentRoadmaps, totalRoles);

    // Roadmap task statistics from actual database
    const totalRoadmapTasks = await RoadmapTask.countDocuments();
    const completedTasks = await RoadmapTask.countDocuments({ status: 'Completed' });
    const inProgressTasks = await RoadmapTask.countDocuments({ status: 'In Progress' });
    const studentProgressPercent = totalRoadmapTasks > 0 ? Math.round((completedTasks / totalRoadmapTasks) * 100) : 0;

    // Recent registered students
    const recentStudents = await User.find({ role: 'student' })
      .select('name email college department academicYear targetCareer careerInterest createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent student activities from Activity collection
    const recentActivitiesRaw = await Activity.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(8);

    const recentActivities = recentActivitiesRaw.map(act => ({
      id: act._id,
      studentName: act.user ? act.user.name : 'Student',
      studentEmail: act.user ? act.user.email : '',
      text: act.text,
      icon: act.icon || 'bi-activity',
      color: act.color || '#059669',
      createdAt: act.createdAt
    }));

    // Career track distribution among students
    const careerCounts = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$targetCareer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalRoles,
        totalAssessments,
        totalTestsTaken,
        totalSkills,
        totalRoadmaps,
        totalRoadmapTasks,
        completedTasks,
        inProgressTasks,
        studentProgressPercent
      },
      careerDistribution: careerCounts,
      recentStudents,
      recentActivities
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};

/**
 * @desc    Get all registered students
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

/**
 * @desc    Get single student details with skills, roadmap tasks, and progress (Excludes password)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin Only)
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const studentSkills = await Skill.find({ user: user._id });
    const roadmapTasks = await RoadmapTask.find({ user: user._id }).sort({ sequence: 1 });
    const assessmentResults = await AssessmentResult.find({ user: user._id }).sort({ createdAt: -1 });
    const projects = await Project.find({ user: user._id }).sort({ createdAt: -1 });
    const certifications = await Certification.find({ user: user._id }).sort({ createdAt: -1 });
    const achievements = await Achievement.find({ user: user._id }).sort({ createdAt: -1 });

    const totalTasks = roadmapTasks.length;
    const completedTasks = roadmapTasks.filter(t => t.status === 'Completed').length;
    const roadmapProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        location: user.location || 'Not provided',
        college: user.college || 'Not stated',
        degree: user.degree || 'B.Tech',
        department: user.department || 'Not stated',
        academicYear: user.academicYear || 'Current Student',
        educationalBackground: user.educationalBackground || 'Computer Science',
        targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
        bio: user.bio || user.professionalSummary || 'No bio summary provided.',
        createdAt: user.createdAt,
        skillsCount: studentSkills.length,
        skills: studentSkills,
        roadmap: {
          totalTasks,
          completedTasks,
          progressPercentage: roadmapProgressPct,
          tasks: roadmapTasks
        },
        assessments: assessmentResults,
        projects,
        certifications,
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve student details.' });
  }
};

/**
 * @desc    Delete user account and cascade clean related records
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin Only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete an administrator account.' });
    }

    // Clean up student artifacts
    await Skill.deleteMany({ user: user._id });
    await RoadmapTask.deleteMany({ user: user._id });
    await UserRoadmap.deleteMany({ user: user._id });
    await AssessmentResult.deleteMany({ user: user._id });
    await Project.deleteMany({ user: user._id });
    await Certification.deleteMany({ user: user._id });
    await Achievement.deleteMany({ user: user._id });
    await Activity.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Student '${user.name}' and associated records removed successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

/**
 * @desc    Get all skills from MongoDB GlobalSkill catalog with student adoption metrics
 * @route   GET /api/admin/skills
 * @access  Private (Admin Only)
 */
exports.getAdminSkills = async (req, res) => {
  try {
    // Check if GlobalSkill catalog is empty, auto-seed if needed
    let globalSkills = await GlobalSkill.find().sort({ name: 1 });
    if (globalSkills.length === 0) {
      for (const s of DEFAULT_PLATFORM_SKILLS) {
        try {
          await GlobalSkill.create(s);
        } catch (e) {
          // ignore duplicate
        }
      }
      globalSkills = await GlobalSkill.find().sort({ name: 1 });
    }

    // Aggregate student adoption counts for each skill
    const studentSkillCounts = await Skill.aggregate([
      {
        $group: {
          _id: '$normalizedName',
          studentCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          verifiedCount: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } }
        }
      }
    ]);

    const countMap = new Map();
    studentSkillCounts.forEach(sc => {
      countMap.set(sc._id, {
        studentCount: sc.studentCount,
        avgRating: Math.round((sc.avgRating || 3) * 10) / 10,
        verifiedCount: sc.verifiedCount
      });
    });

    const enrichedSkills = globalSkills.map(gs => {
      const metrics = countMap.get(gs.normalizedName) || { studentCount: 0, avgRating: 3.0, verifiedCount: 0 };
      return {
        _id: gs._id,
        id: gs._id,
        name: gs.name,
        category: gs.category,
        description: gs.description || '',
        studentCount: metrics.studentCount,
        avgRating: metrics.avgRating,
        verifiedCount: metrics.verifiedCount,
        createdAt: gs.createdAt
      };
    });

    res.status(200).json({
      success: true,
      totalTracked: enrichedSkills.length,
      uniqueSkillsCount: enrichedSkills.length,
      skills: enrichedSkills
    });
  } catch (error) {
    console.error('getAdminSkills error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve skills repository.' });
  }
};

/**
 * @desc    Add a new skill to the platform catalog
 * @route   POST /api/admin/skills
 * @access  Private (Admin Only)
 */
exports.createAdminSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Skill name is required.' });
    }

    const cleanName = name.trim();
    const norm = cleanName.toLowerCase();

    const existing = await GlobalSkill.findOne({ normalizedName: norm });
    if (existing) {
      return res.status(400).json({ success: false, message: `Skill '${cleanName}' already exists in the catalog.` });
    }

    const skill = await GlobalSkill.create({
      name: cleanName,
      normalizedName: norm,
      category: (category || 'Programming').trim(),
      description: (description || '').trim()
    });

    res.status(201).json({
      success: true,
      message: `Skill '${cleanName}' added to platform catalog successfully.`,
      skill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add skill.' });
  }
};

/**
 * @desc    Edit an existing platform skill
 * @route   PUT /api/admin/skills/:id
 * @access  Private (Admin Only)
 */
exports.updateAdminSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const skill = await GlobalSkill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    if (name && name.trim()) {
      const cleanName = name.trim();
      const norm = cleanName.toLowerCase();
      // Check if new name conflicts with another skill
      const duplicate = await GlobalSkill.findOne({ normalizedName: norm, _id: { $ne: skill._id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Skill '${cleanName}' already exists.` });
      }
      skill.name = cleanName;
      skill.normalizedName = norm;
    }

    if (category) skill.category = category.trim();
    if (description !== undefined) skill.description = description.trim();

    await skill.save();

    res.status(200).json({
      success: true,
      message: `Skill '${skill.name}' updated successfully.`,
      skill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update skill.' });
  }
};

/**
 * @desc    Delete a skill from the platform catalog
 * @route   DELETE /api/admin/skills/:id
 * @access  Private (Admin Only)
 */
exports.deleteAdminSkill = async (req, res) => {
  try {
    const skill = await GlobalSkill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Skill '${skill.name}' deleted from platform catalog successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
};

/**
 * @desc    Get all career roles
 * @route   GET /api/admin/roles
 * @access  Private (Admin Only)
 */
exports.getAdminRoles = async (req, res) => {
  try {
    let roles = await CareerRole.find().sort({ title: 1 });
    if (roles.length === 0 && careers && careers.length > 0) {
      // Seed default careers
      for (const c of careers) {
        try {
          await CareerRole.create(c);
        } catch (e) {
          // ignore duplicate
        }
      }
      roles = await CareerRole.find().sort({ title: 1 });
    }
    res.status(200).json({ success: true, count: roles.length, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve career roles.' });
  }
};

/**
 * @desc    Get single career role by ID
 * @route   GET /api/admin/roles/:id
 * @access  Private (Admin Only)
 */
exports.getRoleById = async (req, res) => {
  try {
    const role = await CareerRole.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Career role not found.' });
    }
    res.status(200).json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load career role.' });
  }
};

/**
 * @desc    Create a new Career Role
 * @route   POST /api/admin/roles
 * @access  Private (Admin Only)
 */
exports.createRole = async (req, res) => {
  try {
    const { title, category, description, requiredSkills, averageSalary } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const cleanTitle = title.trim();
    const existing = await CareerRole.findOne({ title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Career role '${cleanTitle}' already exists.` });
    }

    const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : [];

    const role = await CareerRole.create({
      title: cleanTitle,
      category: category || 'Engineering',
      description: description.trim(),
      averageSalary: averageSalary || '₹6 - 12 LPA',
      requiredSkills: skillsArray.map(s => {
        if (typeof s === 'string') {
          return { name: s.trim(), minProficiency: 'Intermediate', requiredLevel: 3, importance: 'High' };
        }
        return {
          name: s.name ? s.name.trim() : 'Skill',
          category: s.category || 'Tech',
          minProficiency: s.minProficiency || 'Intermediate',
          requiredLevel: Number(s.requiredLevel) || 3,
          importance: s.importance || 'High'
        };
      })
    });

    res.status(201).json({ success: true, message: `Career role '${cleanTitle}' created successfully.`, role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create role.' });
  }
};

/**
 * @desc    Update an existing Career Role
 * @route   PUT /api/admin/roles/:id
 * @access  Private (Admin Only)
 */
exports.updateRole = async (req, res) => {
  try {
    const { title, category, description, requiredSkills, averageSalary } = req.body;
    const role = await CareerRole.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Career role not found.' });
    }

    if (title && title.trim()) {
      const cleanTitle = title.trim();
      const duplicate = await CareerRole.findOne({
        title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') },
        _id: { $ne: role._id }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Career role '${cleanTitle}' already exists.` });
      }
      role.title = cleanTitle;
    }

    if (category) role.category = category.trim();
    if (description) role.description = description.trim();
    if (averageSalary) role.averageSalary = averageSalary.trim();

    if (requiredSkills && Array.isArray(requiredSkills)) {
      role.requiredSkills = requiredSkills.map(s => {
        if (typeof s === 'string') {
          return { name: s.trim(), minProficiency: 'Intermediate', requiredLevel: 3, importance: 'High' };
        }
        return {
          name: s.name ? s.name.trim() : 'Skill',
          category: s.category || 'Tech',
          minProficiency: s.minProficiency || 'Intermediate',
          requiredLevel: Number(s.requiredLevel) || 3,
          importance: s.importance || 'High'
        };
      });
    }

    await role.save();

    res.status(200).json({
      success: true,
      message: `Career role '${role.title}' updated successfully.`,
      role
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update career role.' });
  }
};

/**
 * @desc    Delete Career Role
 * @route   DELETE /api/admin/roles/:id
 * @access  Private (Admin Only)
 */
exports.deleteRole = async (req, res) => {
  try {
    const role = await CareerRole.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }
    res.status(200).json({ success: true, message: `Career role '${role.title}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete role.' });
  }
};

/**
 * @desc    Get all assessments with question count and passing statistics
 * @route   GET /api/admin/assessments
 * @access  Private (Admin Only)
 */
exports.getAdminAssessments = async (req, res) => {
  try {
    let assessments = await Assessment.find().lean();

    // Auto-seed baseline assessments if empty
    if (assessments.length === 0 && topics && topics.length > 0) {
      for (const t of topics) {
        const tQuestions = getQuestionsByTopic(t.id, false);
        try {
          await Assessment.create({
            topic: t.id,
            title: t.displayName || t.name,
            skillCategory: t.skillCategory || (t.id === 'html' || t.id === 'css' || t.id === 'javascript' ? 'Frontend' : (t.id === 'sql' ? 'Database' : 'Core CS')),
            relatedSkill: t.displayName || t.name,
            difficulty: 'Beginner',
            description: `Official technical assessment to evaluate proficiency in ${t.displayName || t.name}.`,
            durationMinutes: t.estimatedMinutes || 10,
            passingPercentage: 70,
            questions: tQuestions.map((q, idx) => ({
              questionId: q.id || `q_${idx}`,
              questionText: q.question,
              options: q.options,
              correctOptionIndex: q.correctIndex,
              explanation: q.explanation || ''
            }))
          });
        } catch (e) {
          // ignore
        }
      }
      assessments = await Assessment.find().lean();
    }

    const enriched = await Promise.all(
      assessments.map(async (a) => {
        const attempts = await AssessmentResult.find({ topic: a.topic }).lean();
        const passedCount = attempts.filter(att => att.passed).length;
        const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0;
        const avgScore = attempts.length > 0
          ? Math.round(attempts.reduce((sum, att) => sum + (att.percentage || 0), 0) / attempts.length)
          : 0;

        return {
          id: a._id,
          _id: a._id,
          topic: a.topic,
          title: a.title,
          skillCategory: a.skillCategory || 'Core',
          relatedSkill: a.relatedSkill || a.title,
          description: a.description || '',
          difficulty: a.difficulty || 'Beginner',
          durationMinutes: a.durationMinutes || 15,
          passingPercentage: a.passingPercentage || 70,
          questionsCount: a.questions ? a.questions.length : 0,
          totalAttempts: attempts.length,
          passRate,
          avgScore
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, assessments: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve assessments.' });
  }
};

/**
 * @desc    Get single assessment with full questions and answers for editing
 * @route   GET /api/admin/assessments/:id
 * @access  Private (Admin Only)
 */
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load assessment.' });
  }
};

/**
 * @desc    Create a new assessment with multiple choice questions
 * @route   POST /api/admin/assessments
 * @access  Private (Admin Only)
 */
exports.createAssessment = async (req, res) => {
  try {
    const { title, topic, skillCategory, relatedSkill, difficulty, durationMinutes, passingPercentage, description, questions } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required.' });
    }

    const cleanTitle = title.trim();
    const existing = await Assessment.findOne({ title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Assessment '${cleanTitle}' already exists.` });
    }

    const questionsArray = Array.isArray(questions) ? questions : [];
    if (questionsArray.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one multiple-choice question.' });
    }

    const cleanQuestions = questionsArray.map((q, idx) => ({
      questionId: `q_${Date.now()}_${idx}`,
      questionText: (q.questionText || q.question || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: Number(q.correctOptionIndex) >= 0 ? Number(q.correctOptionIndex) : 0,
      explanation: (q.explanation || '').trim()
    }));

    const topicSlug = (topic || cleanTitle.toLowerCase().split(' ')[0]).replace(/[^a-z0-9]/g, '');

    const assessment = await Assessment.create({
      title: cleanTitle,
      topic: topicSlug,
      skillCategory: skillCategory || 'Programming',
      relatedSkill: (relatedSkill || cleanTitle).trim(),
      description: (description || `Assessment for ${cleanTitle}`).trim(),
      difficulty: difficulty || 'Beginner',
      durationMinutes: Number(durationMinutes) || 15,
      passingPercentage: Number(passingPercentage) || 70,
      questions: cleanQuestions
    });

    res.status(201).json({
      success: true,
      message: `Assessment '${cleanTitle}' created successfully with ${cleanQuestions.length} questions.`,
      assessment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create assessment.' });
  }
};

/**
 * @desc    Update an assessment and its questions
 * @route   PUT /api/admin/assessments/:id
 * @access  Private (Admin Only)
 */
exports.updateAssessment = async (req, res) => {
  try {
    const { title, topic, skillCategory, relatedSkill, difficulty, durationMinutes, passingPercentage, description, questions } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (title && title.trim()) {
      const cleanTitle = title.trim();
      const duplicate = await Assessment.findOne({
        title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') },
        _id: { $ne: assessment._id }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Assessment '${cleanTitle}' already exists.` });
      }
      assessment.title = cleanTitle;
    }

    if (topic) assessment.topic = topic.trim().toLowerCase();
    if (skillCategory) assessment.skillCategory = skillCategory.trim();
    if (relatedSkill) assessment.relatedSkill = relatedSkill.trim();
    if (difficulty) assessment.difficulty = difficulty;
    if (durationMinutes) assessment.durationMinutes = Number(durationMinutes);
    if (passingPercentage) assessment.passingPercentage = Number(passingPercentage);
    if (description !== undefined) assessment.description = description.trim();

    if (questions && Array.isArray(questions)) {
      assessment.questions = questions.map((q, idx) => ({
        questionId: q.questionId || `q_${Date.now()}_${idx}`,
        questionText: (q.questionText || q.question || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: Number(q.correctOptionIndex) >= 0 ? Number(q.correctOptionIndex) : 0,
        explanation: (q.explanation || '').trim()
      }));
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      message: `Assessment '${assessment.title}' updated successfully.`,
      assessment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update assessment.' });
  }
};

/**
 * @desc    Delete assessment
 * @route   DELETE /api/admin/assessments/:id
 * @access  Private (Admin Only)
 */
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Assessment '${assessment.title}' deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete assessment.' });
  }
};

/**
 * @desc    Get roadmap progression metrics and custom career roadmap templates
 * @route   GET /api/admin/roadmaps
 * @access  Private (Admin Only)
 */
exports.getAdminRoadmaps = async (req, res) => {
  try {
    const totalRoadmaps = await UserRoadmap.countDocuments();
    const customRoadmaps = await CareerRoadmap.find().sort({ careerTitle: 1 });

    const totalTasks = await RoadmapTask.countDocuments();
    const completedTasks = await RoadmapTask.countDocuments({ status: 'Completed' });
    const inProgressTasks = await RoadmapTask.countDocuments({ status: 'In Progress' });
    const notStartedTasks = await RoadmapTask.countDocuments({ status: { $in: ['To Do', 'Not Started'] } });

    const tasksByPhase = await RoadmapTask.aggregate([
      { $group: { _id: '$phase', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      totalRoadmaps: Math.max(totalRoadmaps, customRoadmaps.length),
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      progressRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByPhase,
      customRoadmaps
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve roadmap metrics.' });
  }
};

/**
 * @desc    Get single career roadmap template by ID
 * @route   GET /api/admin/roadmaps/:id
 * @access  Private (Admin Only)
 */
exports.getRoadmapById = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }
    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load roadmap.' });
  }
};

/**
 * @desc    Create a custom learning roadmap for a career
 * @route   POST /api/admin/roadmaps
 * @access  Private (Admin Only)
 */
exports.createRoadmap = async (req, res) => {
  try {
    const { careerTitle, description, phases } = req.body;
    if (!careerTitle || !careerTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Career title is required.' });
    }

    const cleanCareer = careerTitle.trim();
    const existing = await CareerRoadmap.findOne({ careerTitle: { $regex: new RegExp(`^${cleanCareer}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Roadmap for '${cleanCareer}' already exists. Please edit the existing one.` });
    }

    const phasesArray = Array.isArray(phases) ? phases : [];
    if (phasesArray.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one phase to the roadmap.' });
    }

    const processedPhases = phasesArray.map((p, pIdx) => ({
      phaseOrder: Number(p.phaseOrder) || (pIdx + 1),
      phaseName: (p.phaseName || `Phase ${pIdx + 1}`).trim(),
      tasks: (Array.isArray(p.tasks) ? p.tasks : []).map((t, tIdx) => ({
        taskId: t.taskId || `task_${Date.now()}_${pIdx}_${tIdx}`,
        title: (t.title || 'Learning Task').trim(),
        instructions: (t.instructions || t.description || '').trim(),
        estimatedEffort: (t.estimatedEffort || '10 - 15 hours').trim(),
        order: Number(t.order) || (tIdx + 1),
        learningResources: Array.isArray(t.learningResources) ? t.learningResources : []
      }))
    }));

    const roadmap = await CareerRoadmap.create({
      careerTitle: cleanCareer,
      description: (description || `Structured learning track for ${cleanCareer}`).trim(),
      phases: processedPhases
    });

    res.status(201).json({
      success: true,
      message: `Roadmap for '${cleanCareer}' created successfully with ${processedPhases.length} phases.`,
      roadmap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create roadmap.' });
  }
};

/**
 * @desc    Update a career roadmap without erasing students' completed task progress
 * @route   PUT /api/admin/roadmaps/:id
 * @access  Private (Admin Only)
 */
exports.updateRoadmap = async (req, res) => {
  try {
    const { careerTitle, description, phases } = req.body;
    const roadmap = await CareerRoadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    if (careerTitle && careerTitle.trim()) {
      roadmap.careerTitle = careerTitle.trim();
    }
    if (description !== undefined) {
      roadmap.description = description.trim();
    }

    if (phases && Array.isArray(phases)) {
      roadmap.phases = phases.map((p, pIdx) => ({
        phaseOrder: Number(p.phaseOrder) || (pIdx + 1),
        phaseName: (p.phaseName || `Phase ${pIdx + 1}`).trim(),
        tasks: (Array.isArray(p.tasks) ? p.tasks : []).map((t, tIdx) => ({
          taskId: t.taskId || `task_${Date.now()}_${pIdx}_${tIdx}`,
          title: (t.title || 'Learning Task').trim(),
          instructions: (t.instructions || t.description || '').trim(),
          estimatedEffort: (t.estimatedEffort || '10 - 15 hours').trim(),
          order: Number(t.order) || (tIdx + 1),
          learningResources: Array.isArray(t.learningResources) ? t.learningResources : []
        }))
      }));
    }

    await roadmap.save();

    // Preserve students' completed task progress by updating instructions without wiping statuses
    try {
      for (const ph of roadmap.phases) {
        for (const tk of ph.tasks) {
          // If students have this task by title, update the instructions/effort while leaving status intact
          await RoadmapTask.updateMany(
            { title: tk.title },
            {
              $set: {
                phase: ph.phaseName,
                description: tk.instructions || tk.title,
                estimatedEffort: tk.estimatedEffort,
                learningResources: tk.learningResources
              }
            }
          );
        }
      }
    } catch (syncErr) {
      console.warn('Roadmap task content sync note:', syncErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Roadmap for '${roadmap.careerTitle}' updated successfully. Student completion progress preserved.`,
      roadmap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update roadmap.' });
  }
};

/**
 * @desc    Delete a career roadmap
 * @route   DELETE /api/admin/roadmaps/:id
 * @access  Private (Admin Only)
 */
exports.deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Roadmap for '${roadmap.careerTitle}' deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete roadmap.' });
  }
};

/**
 * @desc    Get platform reports and data analytics
 * @route   GET /api/admin/reports
 * @access  Private (Admin Only)
 */
exports.getAdminReports = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Career distribution
    const careerInterestStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$targetCareer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Assessment pass rates by topic
    const assessmentStats = await AssessmentResult.aggregate([
      {
        $group: {
          _id: '$topic',
          totalAttempts: { $sum: 1 },
          passedAttempts: { $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] } },
          avgPercentage: { $avg: '$percentage' }
        }
      },
      {
        $project: {
          topic: '$_id',
          totalAttempts: 1,
          passedAttempts: 1,
          passRate: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $round: [{ $multiply: [{ $divide: ['$passedAttempts', '$totalAttempts'] }, 100] }, 1] },
              0
            ]
          },
          avgPercentage: { $round: ['$avgPercentage', 1] }
        }
      }
    ]);

    // Skill proficiency levels breakdown
    const proficiencyStats = await Skill.aggregate([
      { $group: { _id: '$proficiency', count: { $sum: 1 } } }
    ]);

    // Student college distribution
    const collegeStats = await User.aggregate([
      { $match: { role: 'student', college: { $ne: '' } } },
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Roadmap overall completion summary
    const totalRoadmapTasks = await RoadmapTask.countDocuments();
    const completedRoadmapTasks = await RoadmapTask.countDocuments({ status: 'Completed' });
    const inProgressRoadmapTasks = await RoadmapTask.countDocuments({ status: 'In Progress' });
    const roadmapSummary = {
      totalTasks: totalRoadmapTasks,
      completedTasks: completedRoadmapTasks,
      inProgressTasks: inProgressRoadmapTasks,
      completionRate: totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100) : 0
    };

    res.status(200).json({
      success: true,
      totalStudents,
      careerInterestStats,
      assessmentStats,
      proficiencyStats,
      collegeStats,
      roadmapSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate reports.' });
  }
};

/**
 * @desc    Get authenticated administrator profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin Only)
 */
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'Admin',
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin profile.' });
  }
};

/**
 * @desc    Update administrator profile (Only permitted personal details; role cannot be changed)
 * @route   PUT /api/admin/profile
 * @access  Private (Admin Only)
 */
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const duplicate = await User.findOne({ email: cleanEmail, _id: { $ne: req.user._id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    admin.name = name.trim();
    admin.email = cleanEmail;
    // Explicitly enforce that role NEVER changes via profile update
    admin.role = 'admin';

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'Admin',
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update admin profile.' });
  }
};

/**
 * @desc    Get entrance assessment completion metrics and student-wise verified skills
 * @route   GET /api/admin/entrance-assessments
 * @access  Private (Admin Only)
 */
exports.getAdminEntranceAssessments = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    const allEntranceResults = await AssessmentResult.find({ type: 'entrance' }).sort({ createdAt: -1 });

    let completedCount = 0;
    let totalVerifiedSkills = 0;

    const studentReports = await Promise.all(
      students.map(async (student) => {
        const isCompleted = Boolean(student.entranceAssessmentCompleted);
        if (isCompleted) completedCount++;

        // Fetch skills for this student
        const dbSkills = await Skill.find({ user: student._id });
        const embeddedSkills = student.skills || [];
        const skillMap = new Map();

        embeddedSkills.forEach(s => {
          if (s && s.name) skillMap.set((s.normalizedName || s.name).toLowerCase(), s);
        });
        dbSkills.forEach(s => {
          if (s && s.name) skillMap.set((s.normalizedName || s.name).toLowerCase(), s);
        });

        const studentSkills = Array.from(skillMap.values());
        const studentResults = allEntranceResults.filter(r => r.user.toString() === student._id.toString());

        const verifiedSkills = [];
        const notVerifiedSkills = [];
        const studentSkillsList = [];

        studentSkills.forEach(sk => {
          const skNorm = normalizeSkillKey(sk.normalizedName || sk.name);
          const match = studentResults.find(r => {
            const rNorm = normalizeSkillKey(r.skillName || r.topic || r.assessmentTitle);
            return rNorm === skNorm || (r.skillName && r.skillName.toLowerCase() === sk.name.toLowerCase());
          });

          const isVer = Boolean(sk.isVerified || (match && match.passed));
          const score = match ? match.percentage : (sk.verificationScore || (isVer ? 80 : 0));
          const rawScore = match ? match.score : (sk.verificationScore ? Math.round((sk.verificationScore / 100) * 5) : null);
          const scoreText = rawScore !== null ? `${rawScore}/5` : (match ? `${match.percentage}%` : 'Unassessed');
          const identifiedLevel = match?.identifiedLevel || sk.proficiency || (isVer ? 'Intermediate' : 'Unassessed');
          const status = isVer ? 'VERIFIED' : (match ? 'NOT VERIFIED' : 'UNASSESSED');

          const skillObj = {
            name: sk.name,
            score: scoreText,
            rawScore,
            percentage: score,
            identifiedLevel,
            status,
            isVerified: isVer
          };

          studentSkillsList.push(skillObj);

          if (isVer) {
            verifiedSkills.push(skillObj);
            totalVerifiedSkills++;
          } else if (match) {
            notVerifiedSkills.push(skillObj);
          }
        });

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          targetCareer: student.targetCareer || student.careerInterest || 'Full Stack Developer',
          assessmentStatus: isCompleted ? 'Completed' : 'Pending',
          assessmentDate: student.entranceAssessmentDate ? new Date(student.entranceAssessmentDate).toLocaleDateString() : 'Pending',
          averageScore: (student.entranceAssessmentSummary && student.entranceAssessmentSummary.averageScore) || 
                        (studentResults.length > 0 ? Math.round(studentResults.reduce((a, b) => a + (b.percentage || 0), 0) / studentResults.length) : 0),
          allSkills: studentSkillsList,
          verifiedSkills,
          notVerifiedSkills,
          totalAssessed: verifiedSkills.length + notVerifiedSkills.length,
          attemptsCount: studentResults.length
        };
      })
    );

    const totalStudents = students.length;
    const incompleteCount = totalStudents - completedCount;
    const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        completedCount,
        incompleteCount,
        completionRate,
        totalVerifiedSkills
      },
      students: studentReports
    });
  } catch (error) {
    console.error('Admin Entrance Assessments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve entrance assessment metrics.'
    });
  }
};
