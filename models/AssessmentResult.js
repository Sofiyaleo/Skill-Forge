/**
 * models/AssessmentResult.js
 * Records student attempts on assessments, scores, percentages, and pass statuses.
 */

const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    topic: {
      type: String,
      trim: true
    },
    assessmentTitle: {
      type: String,
      default: function() {
        return this.topic || 'Skill Assessment';
      }
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      default: false
    },
    answers: [{
      type: mongoose.Schema.Types.Mixed
    }],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
