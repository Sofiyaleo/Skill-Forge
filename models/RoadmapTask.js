const mongoose = require('mongoose');

const roadmapTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [120, 'Task title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    sequence: {
      type: Number,
      default: 1
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started'
    },
    sourceSkill: {
      type: String,
      trim: true,
      default: ''
    },
    phase: {
      type: String,
      trim: true,
      default: 'Phase 2 — Core Technical Skills'
    },
    whyItMatters: {
      type: String,
      trim: true,
      default: ''
    },
    whatToLearn: [{
      type: String,
      trim: true
    }],
    whatToPractice: [{
      type: String,
      trim: true
    }],
    deliverable: {
      type: String,
      trim: true,
      default: ''
    },
    completionCriteria: {
      type: String,
      trim: true,
      default: ''
    },
    estimatedEffort: {
      type: String,
      trim: true,
      default: '8 - 12 hours'
    },
    learningResources: [
      {
        title: { type: String, trim: true },
        url: { type: String, trim: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

const RoadmapTask = mongoose.model('RoadmapTask', roadmapTaskSchema);
module.exports = RoadmapTask;
