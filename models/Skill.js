const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [60, 'Skill name cannot exceed 60 characters']
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Database',
        'Tools and Platforms',
        'Data Analysis',
        'Design',
        'Communication',
        'Problem Solving',
        'Other',
        'Frontend',
        'Backend',
        'DevOps',
        'Mobile',
        'Data & AI',
        'Soft Skills',
        'Core CS'
      ],
      default: 'Other'
    },
    proficiency: {
      type: String,
      required: [true, 'Proficiency level is required'],
      enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Map proficiency string to 1-5 rating & vice versa
const PROFICIENCY_TO_RATING = {
  'Beginner': 1,
  'Basic': 2,
  'Intermediate': 3,
  'Advanced': 4,
  'Expert': 5
};

const RATING_TO_PROFICIENCY = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert'
};

// Compound unique index: prevent duplicate skills for the same user
skillSchema.index({ user: 1, normalizedName: 1 }, { unique: true });

// Pre-validate hook to ensure normalizedName, rating and proficiency stay in sync
skillSchema.pre('validate', function () {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }
  if (this.proficiency && !this.rating) {
    this.rating = PROFICIENCY_TO_RATING[this.proficiency] || 1;
  } else if (this.rating && !this.proficiency) {
    this.proficiency = RATING_TO_PROFICIENCY[this.rating] || 'Beginner';
  } else if (this.proficiency && this.rating) {
    this.rating = PROFICIENCY_TO_RATING[this.proficiency] || this.rating;
  }
});

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
