/**
 * models/CareerRoadmap.js
 * Career learning roadmap templates managed by administrators.
 * Defines structured learning phases, milestones, instructions, effort, and resources.
 */

const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  estimatedEffort: {
    type: String,
    default: '10 - 15 hours'
  },
  order: {
    type: Number,
    default: 1
  },
  learningResources: [{
    title: { type: String, trim: true },
    url: { type: String, trim: true }
  }]
});

const phaseSchema = new mongoose.Schema({
  phaseOrder: {
    type: Number,
    default: 1
  },
  phaseName: {
    type: String,
    required: [true, 'Phase name is required'],
    trim: true
  },
  tasks: [taskItemSchema]
});

const careerRoadmapSchema = new mongoose.Schema(
  {
    careerTitle: {
      type: String,
      required: [true, 'Career title is required'],
      unique: true,
      trim: true
    },
    careerRole: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    phases: [phaseSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to populate careerRole slug
careerRoadmapSchema.pre('save', function () {
  if (this.careerTitle && !this.careerRole) {
    this.careerRole = this.careerTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
