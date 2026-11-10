/**
 * models/User.js
 * Mongoose User model for SkillForge.
 * Includes password hashing with bcrypt and helper methods.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Data & AI', 'Soft Skills', 'Other'],
    default: 'Frontend'
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

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Excluded by default in queries for security
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  location: {
    type: String,
    default: 'Bangalore, India'
  },
  education: {
    type: String,
    default: 'B.Tech / MCA in Computer Science - ABC College'
  },
  careerInterest: {
    type: String,
    default: 'Web Developer'
  },
  bio: {
    type: String,
    default: 'Dedicated computer science student passionate about building real-world applications.'
  },
  skills: [skillSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook: Hash password before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: Compare provided password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
