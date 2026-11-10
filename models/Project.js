/**
 * models/Project.js
 * Tracks student software and academic projects.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    techStack: [{
      type: String,
      trim: true
    }],
    technologies: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Planned'],
      default: 'Completed'
    },
    githubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    liveUrl: {
      type: String,
      trim: true,
      default: ''
    },
    projectUrl: {
      type: String,
      trim: true,
      default: ''
    },
    completionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Keep techStack and technologies in sync, and liveUrl/projectUrl in sync
projectSchema.pre('save', function (next) {
  if (this.techStack && this.techStack.length > 0 && (!this.technologies || this.technologies.length === 0)) {
    this.technologies = [...this.techStack];
  } else if (this.technologies && this.technologies.length > 0 && (!this.techStack || this.techStack.length === 0)) {
    this.techStack = [...this.technologies];
  }

  if (this.liveUrl && !this.projectUrl) {
    this.projectUrl = this.liveUrl;
  } else if (this.projectUrl && !this.liveUrl) {
    this.liveUrl = this.projectUrl;
  }

  next();
});

module.exports = mongoose.model('Project', projectSchema);
