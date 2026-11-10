/**
 * models/CareerRole.js
 * Represents high-demand industry job roles, required skill benchmarks,
 * and structured learning roadmaps.
 */

const mongoose = require('mongoose');

const careerRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Role title is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Data', 'Design', 'Business', 'Others'],
    default: 'Tech'
  },
  description: {
    type: String,
    required: [true, 'Role description is required']
  },
  requiredSkills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    requiredLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    importance: {
      type: String,
      enum: ['Must-Have', 'Good-To-Have'],
      default: 'Must-Have'
    }
  }],
  roadmapSteps: [{
    stepOrder: Number,
    weekTitle: String, // e.g., "Week 1-2: Basics", "Week 3-4: Advanced Topics"
    tasks: [{
      taskId: String,
      title: String,
      description: String,
      resourceLink: String,
      defaultStatus: {
        type: String,
        enum: ['Completed', 'In Progress', 'To Do'],
        default: 'To Do'
      }
    }]
  }],
  averageSalary: {
    type: String,
    default: '₹6 - 12 LPA'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareerRole', careerRoleSchema);
