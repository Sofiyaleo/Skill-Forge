/**
 * models/CareerRole.js
 * Represents high-demand industry job roles, required skill benchmarks,
 * suggested projects, topics, and structured learning roadmaps.
 */

const mongoose = require('mongoose');

const careerRoleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      required: [true, 'Role title is required'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Engineering'
    },
    icon: {
      type: String,
      default: 'bi-code-slash'
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true
    },
    responsibilities: [{
      type: String,
      trim: true
    }],
    requiredSkills: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        default: 'Web Development'
      },
      minProficiency: {
        type: String,
        enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
      },
      requiredLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      importance: {
        type: String,
        default: 'High'
      }
    }],
    suggestedProjects: [{
      title: { type: String, trim: true },
      description: { type: String, trim: true }
    }],
    recommendedTopics: [{
      type: String,
      trim: true
    }],
    roadmapSteps: [{
      stepOrder: Number,
      weekTitle: String,
      tasks: [{
        taskId: String,
        title: String,
        description: String,
        resourceLink: String,
        defaultStatus: {
          type: String,
          default: 'To Do'
        }
      }]
    }],
    averageSalary: {
      type: String,
      default: '₹6 - 12 LPA'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure slug id and requiredLevel sync
careerRoleSchema.pre('save', function (next) {
  if (this.title && !this.id) {
    this.id = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const PROFICIENCY_RANKS = {
    'Beginner': 1,
    'Basic': 2,
    'Intermediate': 3,
    'Advanced': 4,
    'Expert': 5
  };
  const RATING_TO_PROF = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  if (this.requiredSkills && this.requiredSkills.length > 0) {
    this.requiredSkills.forEach(skill => {
      if (skill.minProficiency && !skill.requiredLevel) {
        skill.requiredLevel = PROFICIENCY_RANKS[skill.minProficiency] || 3;
      } else if (skill.requiredLevel && !skill.minProficiency) {
        skill.minProficiency = RATING_TO_PROF[skill.requiredLevel] || 'Intermediate';
      }
    });
  }

  next();
});

module.exports = mongoose.model('CareerRole', careerRoleSchema);
