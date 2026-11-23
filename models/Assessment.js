/**
 * models/Assessment.js
 * Manages skill verification quizzes, MCQs, and user test histories.
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String
  },
  questionText: {
    type: String,
    required: true
  },
  concept: {
    type: String,
    default: ''
  },
  options: [{
    type: String,
    required: true
  }],
  correctOptionIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const assessmentSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      unique: true,
      trim: true
    },
    skillCategory: {
      type: String,
      required: true
    },
    relatedSkill: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    icon: {
      type: String,
      default: 'bi-code-slash'
    },
    badgeColor: {
      type: String,
      default: '#059669'
    },
    durationMinutes: {
      type: Number,
      default: 15
    },
    passingPercentage: {
      type: Number,
      default: 70
    },
    questions: [questionSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to populate topic slug if not set
assessmentSchema.pre('save', function (next) {
  if (this.title && !this.topic) {
    this.topic = this.title.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
  }
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
