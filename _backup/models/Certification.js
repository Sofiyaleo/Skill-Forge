/**
 * models/Certification.js
 * Tracks student certifications, credentials, and issuance dates.
 */

const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Certification title is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: [true, 'Issuing organization is required'],
    trim: true
  },
  issueDate: {
    type: String,
    default: 'Apr 2025'
  },
  credentialUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certification', certificationSchema);
