/**
 * models/Certification.js
 * Tracks student certifications, credentials, and issuance dates.
 */

const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    name: {
      type: String,
      trim: true
    },
    issuer: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true
    },
    issueDate: {
      type: String,
      default: ''
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Keep title and name in sync
certificationSchema.pre('save', function (next) {
  if (this.title && !this.name) {
    this.name = this.title;
  } else if (this.name && !this.title) {
    this.title = this.name;
  }
  next();
});

module.exports = mongoose.model('Certification', certificationSchema);
