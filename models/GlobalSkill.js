/**
 * models/GlobalSkill.js
 * Platform-wide master skills catalog managed by administrators.
 * Available to students during skill selection and career gap analysis.
 */

const mongoose = require('mongoose');

const globalSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Programming'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

globalSkillSchema.pre('validate', function () {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }
});

module.exports = mongoose.model('GlobalSkill', globalSkillSchema);
