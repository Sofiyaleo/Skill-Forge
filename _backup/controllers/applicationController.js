/**
 * controllers/applicationController.js
 * Handles Internship & Job Application Tracker with stage metrics.
 */

const Application = require('../models/Application');
const Activity = require('../models/Activity');

/**
 * @desc    Get all applications and stage counts
 * @route   GET /api/applications
 * @access  Private
 */
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Calculate stage counts for pipeline display
    const stages = {
      wishlist: 0,
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0
    };

    applications.forEach(app => {
      const key = (app.status || 'Applied').toLowerCase();
      if (stages[key] !== undefined) {
        stages[key]++;
      }
    });

    res.status(200).json({
      success: true,
      totalCount: applications.length,
      stages,
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
  }
};

/**
 * @desc    Add a new internship application
 * @route   POST /api/applications
 * @access  Private
 */
exports.createApplication = async (req, res) => {
  try {
    const { companyName, roleTitle, location, status, appliedDate, notes } = req.body;
    if (!companyName || !roleTitle) {
      return res.status(400).json({ success: false, message: 'Company and role are required.' });
    }

    const application = await Application.create({
      user: req.user.id,
      companyName: companyName.trim(),
      roleTitle: roleTitle.trim(),
      location: location || 'Remote',
      status: status || 'Applied',
      appliedDate: appliedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: notes || ''
    });

    // Log Activity
    await Activity.create({
      user: req.user.id,
      text: `Applied for ${roleTitle} at ${companyName}`,
      icon: 'bi-briefcase',
      color: '#EC4899'
    });

    res.status(201).json({
      success: true,
      message: 'Application tracked successfully.',
      application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create application.' });
  }
};

/**
 * @desc    Update application status
 * @route   PUT /api/applications/:id
 * @access  Private
 */
exports.updateApplication = async (req, res) => {
  try {
    const { status, notes, interviewDate } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.user.id });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    if (interviewDate !== undefined) application.interviewDate = interviewDate;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
};

/**
 * @desc    Delete application
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({ success: true, message: 'Application deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application.' });
  }
};
