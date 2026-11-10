/**
 * models/Assessment.js & AssessmentResult.js
 * Manages skill verification quizzes, MCQs, and user test histories.
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
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

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    unique: true
  },
  skillCategory: {
    type: String,
    required: true
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
    default: '#6366F1'
  },
  durationMinutes: {
    type: Number,
    default: 15
  },
  passingPercentage: {
    type: Number,
    default: 70
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
