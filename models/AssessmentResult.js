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
    skillName: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['entrance', 'regular'],
      default: 'regular',
      index: true
    },
    assessmentTitle: {
      type: String,
      default: function() {
        return this.skillName || this.topic || 'Skill Assessment';
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
    correctAnswersCount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      required: true
    },
    passingThreshold: {
      type: Number,
      default: 60
    },
    passed: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'NOT VERIFIED', 'PRACTICE_COMPLETED'],
      default: 'NOT VERIFIED'
    },
    identifiedLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Unassessed'],
      default: 'Beginner'
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
<<<<<<< HEAD
=======
    classification: {
      type: String,
      enum: ['Strong Foundation', 'Developing', 'Needs Improvement', 'Unassessed'],
      default: 'Unassessed'
    },
    recommendation: {
      type: String,
      default: ''
    },
    encouragingFeedback: {
      type: String,
      default: ''
    },
    topicsToImprove: [{
      type: String
    }],
>>>>>>> f2e0bca (Improved skill improvement practice assessments)
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
