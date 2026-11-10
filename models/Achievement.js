/**
 * models/Achievement.js
 * Records student academic honors, hackathons, college awards, and competitions.
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an achievement title'],
      trim: true,
      maxlength: [150, 'Achievement title cannot exceed 150 characters']
    },
    issuer: {
      type: String,
      required: [true, 'Please provide the issuing organization or institution'],
      trim: true
    },
    date: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    url: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
