/**
 * models/UserRoadmap.js
 * Tracks custom task completion and progress for student learning roadmaps.
 */

const mongoose = require('mongoose');

const userRoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roleTitle: {
    type: String,
    required: true
  },
  completedTaskIds: [{
    type: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserRoadmap', userRoadmapSchema);
