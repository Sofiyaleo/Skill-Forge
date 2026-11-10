/**
 * controllers/portfolioController.js
 * Handles full CRUD for student projects and certifications.
 */

const Project = require('../models/Project');
const Certification = require('../models/Certification');
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
    const { title, techStack, description, status, githubUrl, liveUrl } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const techArray = Array.isArray(techStack)
      ? techStack
      : (techStack || '').split(',').map(t => t.trim()).filter(Boolean);

    const project = await Project.create({
      user: req.user.id,
      title: title.trim(),
      techStack: techArray,
      description: description || '',
      status: status || 'Completed',
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || ''
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
    res.status(500).json({ success: false, message: 'Failed to create project.' });
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
    const { title, issuer, issueDate, credentialUrl } = req.body;
    if (!title || !issuer) {
      return res.status(400).json({ success: false, message: 'Title and issuing organization are required.' });
    }

    const cert = await Certification.create({
      user: req.user.id,
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      credentialUrl: credentialUrl || ''
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
