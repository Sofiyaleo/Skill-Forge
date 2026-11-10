/**
 * models/Activity.js
 * Logs real user actions for the "Recent Activities" dashboard widget.
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'bi-check2-circle'
  },
  color: {
    type: String,
    default: '#6366F1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
