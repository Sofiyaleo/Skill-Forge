/**
 * controllers/portfolioController.js
 * Handles full CRUD for student projects and certifications.
 */

const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');
const Activity = require('../models/Activity');

// --- PROJECTS ---

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, techStack, description, status, githubUrl, liveUrl, completionDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const techArray = Array.isArray(techStack)
      ? techStack
      : (techStack || '').split(',').map(t => t.trim()).filter(Boolean);

    const project = await Project.create({
      user: req.user.id,
      title: title.trim(),
      techStack: techArray,
      technologies: techArray,
      description: (description || '').trim(),
      status: status || 'Completed',
      githubUrl: (githubUrl || '').trim(),
      liveUrl: (liveUrl || '').trim(),
      projectUrl: (liveUrl || githubUrl || '').trim(),
      completionDate: completionDate ? new Date(completionDate) : new Date()
    });

    // Log activity
    await Activity.create({
      user: req.user.id,
      text: `Added new project '${project.title}'`,
      icon: 'bi-folder-plus',
      color: '#10B981'
    });

    res.status(201).json({ success: true, message: 'Project added successfully.', project });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, techStack, description, status, githubUrl, liveUrl, completionDate } = req.body;

    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (title) project.title = title.trim();
    if (techStack !== undefined) {
      const techArray = Array.isArray(techStack)
        ? techStack
        : (techStack || '').split(',').map(t => t.trim()).filter(Boolean);
      project.techStack = techArray;
      project.technologies = techArray;
    }
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
    if (liveUrl !== undefined) {
      project.liveUrl = liveUrl.trim();
      project.projectUrl = liveUrl.trim();
    }
    if (completionDate) project.completionDate = new Date(completionDate);

    await project.save();

    res.status(200).json({ success: true, message: 'Project updated successfully.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
};

// --- CERTIFICATIONS ---

exports.getCerts = async (req, res) => {
  try {
    const certs = await Certification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: certs.length, certifications: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve certifications.' });
  }
};

exports.createCert = async (req, res) => {
  try {
    const { title, name, issuer, issueDate, credentialUrl } = req.body;
    const finalTitle = (title || name || '').trim();
    if (!finalTitle || !issuer || !issuer.trim()) {
      return res.status(400).json({ success: false, message: 'Title and issuing organization are required.' });
    }

    const cert = await Certification.create({
      user: req.user.id,
      title: finalTitle,
      name: finalTitle,
      issuer: issuer.trim(),
      issueDate: (issueDate || '').trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      credentialUrl: (credentialUrl || '').trim()
    });

    // Log activity
    await Activity.create({
      user: req.user.id,
      text: `Added certification '${cert.title}'`,
      icon: 'bi-award-fill',
      color: '#8B5CF6'
    });

    res.status(201).json({ success: true, message: 'Certification added successfully.', certification: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add certification.' });
  }
};

exports.updateCert = async (req, res) => {
  try {
    const { title, name, issuer, issueDate, credentialUrl } = req.body;
    const cert = await Certification.findOne({ _id: req.params.id, user: req.user.id });
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found.' });
    }

    const finalTitle = (title || name || '').trim();
    if (finalTitle) {
      cert.title = finalTitle;
      cert.name = finalTitle;
    }
    if (issuer) cert.issuer = issuer.trim();
    if (issueDate !== undefined) cert.issueDate = issueDate.trim();
    if (credentialUrl !== undefined) cert.credentialUrl = credentialUrl.trim();

    await cert.save();

    res.status(200).json({ success: true, message: 'Certification updated successfully.', certification: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update certification.' });
  }
};

exports.deleteCert = async (req, res) => {
  try {
    const cert = await Certification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found.' });
    }
    res.status(200).json({ success: true, message: 'Certification deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete certification.' });
  }
};

// --- ACHIEVEMENTS ---

exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: achievements.length, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve achievements.' });
  }
};

exports.createAchievement = async (req, res) => {
  try {
    const { title, issuer, date, description, url } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Achievement title is required.' });
    }
    if (!issuer || !issuer.trim()) {
      return res.status(400).json({ success: false, message: 'Issuing organization is required.' });
    }

    const achievement = await Achievement.create({
      user: req.user.id,
      title: title.trim(),
      issuer: issuer.trim(),
      date: (date || '').trim(),
      description: (description || '').trim(),
      url: (url || '').trim()
    });

    // Log activity
    await Activity.create({
      user: req.user.id,
      text: `Added new achievement: '${achievement.title}'`,
      icon: 'bi-trophy',
      color: '#D97706'
    });

    res.status(201).json({ success: true, message: 'Achievement added successfully.', achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add achievement.' });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const { title, issuer, date, description, url } = req.body;
    const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user.id });
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }

    if (title) achievement.title = title.trim();
    if (issuer) achievement.issuer = issuer.trim();
    if (date !== undefined) achievement.date = date.trim();
    if (description !== undefined) achievement.description = description.trim();
    if (url !== undefined) achievement.url = url.trim();

    await achievement.save();

    res.status(200).json({ success: true, message: 'Achievement updated successfully.', achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update achievement.' });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }
    res.status(200).json({ success: true, message: 'Achievement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete achievement.' });
  }
};

