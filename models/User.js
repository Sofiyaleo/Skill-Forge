/**
 * models/User.js
 * Consolidated User model for SkillForge.
 * Includes academic details, educational background, target career,
 * password hashing with bcrypt, skills array, and security helper methods.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  normalizedName: {
    type: String,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
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
    default: 'Programming'
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert', 'Unassessed'],
    default: 'Unassessed'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 98765 43210'
    },
    location: {
      type: String,
      trim: true,
      default: 'Bangalore, India'
    },
    // Academic & Educational Information (Prompt Requirement 4)
    college: {
      type: String,
      trim: true,
      default: ''
    },
    degree: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    academicYear: {
      type: String,
      trim: true,
      default: ''
    },
    educationalBackground: {
      type: String,
      trim: true,
      default: 'Computer Science'
    },
    education: {
      type: String,
      trim: true,
      default: ''
    },
    // Target Career Goal (Prompt Requirement 4)
    targetCareer: {
      type: String,
      trim: true,
      default: 'Full Stack Developer'
    },
    careerInterest: {
      type: String,
      trim: true,
      default: 'Full Stack Developer'
    },
    bio: {
      type: String,
      trim: true,
      default: 'Dedicated student passionate about building real-world software and modern applications.'
    },
    professionalSummary: {
      type: String,
      trim: true,
      default: ''
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: ''
    },
    githubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: ''
    },
    graduationYear: {
      type: String,
      trim: true,
      default: ''
    },
    resumeTemplate: {
      type: String,
      enum: ['modern', 'minimal', 'classic'],
      default: 'modern'
    },
    // Entrance Assessment & Skill Verification fields
    entranceAssessmentCompleted: {
      type: Boolean,
      default: false
    },
    entranceAssessmentStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    entranceAssessmentDate: {
      type: Date
    },
    entranceAssessmentSummary: {
      totalSkillsAssessed: { type: Number, default: 0 },
      verifiedSkillsCount: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 }
    },
    entranceAssessmentProgress: {
      completedSkillNames: [{ type: String }],
      currentSkillIndex: { type: Number, default: 0 },
      savedAnswers: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    skills: [skillSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password and sync redundant fields
userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Keep targetCareer and careerInterest in sync
  if (this.isModified('targetCareer') && !this.isModified('careerInterest')) {
    this.careerInterest = this.targetCareer;
  } else if (this.isModified('careerInterest') && !this.isModified('targetCareer')) {
    this.targetCareer = this.careerInterest;
  }

  // Keep professionalSummary and bio in sync
  if (this.isModified('bio') && !this.professionalSummary) {
    this.professionalSummary = this.bio;
  } else if (this.isModified('professionalSummary') && !this.bio) {
    this.bio = this.professionalSummary;
  }

  // Keep education field formatted
  if (this.college || this.degree) {
    const parts = [];
    if (this.degree) parts.push(this.degree);
    if (this.department) parts.push(`in ${this.department}`);
    if (this.college) parts.push(`- ${this.college}`);
    this.education = parts.join(' ');
  }

  // Sync skill ratings & proficiencies
  const PROFICIENCY_MAP = {
    'Unassessed': 1,
    'Beginner': 1,
    'Basic': 2,
    'Intermediate': 3,
    'Advanced': 4,
    'Expert': 5
  };
  const RATING_MAP = {
    1: 'Beginner',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  };

  if (this.skills && this.skills.length > 0) {
    this.skills.forEach(skill => {
      if (skill.name) {
        skill.normalizedName = skill.name.trim().toLowerCase();
      }
      if (skill.proficiency && !skill.rating) {
        skill.rating = PROFICIENCY_MAP[skill.proficiency] || 3;
      } else if (skill.rating && !skill.proficiency) {
        skill.proficiency = RATING_MAP[skill.rating] || 'Intermediate';
      }
    });
  }

  next();
});

// Method: Compare provided password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Safely return user object without password
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
