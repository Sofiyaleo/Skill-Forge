/**
 * models/Application.js
 * Tracks student internship and job applications across career stages.
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  roleTitle: {
    type: String,
    required: [true, 'Role title is required'],
    trim: true
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true
  },
  status: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'],
    default: 'Applied'
  },
  appliedDate: {
    type: String,
    default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
