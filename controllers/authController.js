/**
 * controllers/authController.js
 * Handles student and administrator authentication operations:
 * - Multi-step Student Registration (Academic info, educational background, skills, career goal)
 * - Login (with password verification)
 * - Profile retrieval
 * - Logout
 */

const User = require('../models/User');
const Skill = require('../models/Skill');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const { generateUserRoadmap } = require('../services/roadmapService');

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillforge_secret_key', {
    expiresIn: '7d'
  });
};

// Helper: Send token in response and HTTP-only cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetCareer: user.targetCareer || user.careerInterest || 'Full Stack Developer',
        careerInterest: user.careerInterest || user.targetCareer || 'Full Stack Developer',
        college: user.college || '',
        degree: user.degree || '',
        department: user.department || '',
        academicYear: user.academicYear || '',
        educationalBackground: user.educationalBackground || '',
        education: user.education || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skillsCount: user.skills ? user.skills.length : 0,
        entranceAssessmentCompleted: Boolean(user.entranceAssessmentCompleted),
        entranceAssessmentStatus: user.entranceAssessmentStatus || 'not_started'
      }
    });
};

/**
 * @desc    Register a new student with complete academic, skill, and career details
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      location,
      college,
      degree,
      department,
      academicYear,
      educationalBackground,
      customBackground,
      targetCareer,
      bio,
      professionalSummary,
      skills
    } = req.body;

    // 1. Validate required basic account details
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match. Please re-enter.' });
    }

    // 2. Duplicate email prevention
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // 3. Process educational background
    let finalBackground = (educationalBackground || '').trim();
    if (finalBackground === 'Other' && customBackground && customBackground.trim()) {
      finalBackground = customBackground.trim();
    } else if (!finalBackground) {
      finalBackground = 'Computer Science';
    }

    // 4. Process target career
    const finalCareer = (targetCareer || 'Full Stack Developer').trim();

    // 5. Process skills
    const PROFICIENCY_RANKS = {
      'Beginner': 1,
      'Basic': 2,
      'Intermediate': 3,
      'Advanced': 4,
      'Expert': 5
    };

    let processedSkills = [];
    const rawSkills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? JSON.parse(skills || '[]') : []);

    const seenSkillNames = new Set();
    rawSkills.forEach(s => {
      if (!s || !s.name || !s.name.trim()) return;
      const cleanName = s.name.trim();
      const normKey = cleanName.toLowerCase();
      if (seenSkillNames.has(normKey)) return; // Prevent duplicate skills
      seenSkillNames.add(normKey);

      const prof = s.proficiency || (s.rating ? (['Beginner','Basic','Intermediate','Advanced','Expert'][s.rating-1] || 'Intermediate') : 'Intermediate');
      const rating = PROFICIENCY_RANKS[prof] || Number(s.rating) || 3;

      processedSkills.push({
        name: cleanName,
        normalizedName: normKey,
        category: s.category || 'Programming',
        proficiency: prof,
        rating: rating,
        isVerified: false
      });
    });

    // If user provided no skills, assign a helpful foundational starter set
    if (processedSkills.length === 0) {
      processedSkills = [
        { name: 'HTML5', normalizedName: 'html5', category: 'Web Development', proficiency: 'Intermediate', rating: 3, isVerified: false },
        { name: 'CSS3', normalizedName: 'css3', category: 'Web Development', proficiency: 'Intermediate', rating: 3, isVerified: false },
        { name: 'JavaScript', normalizedName: 'javascript', category: 'Programming', proficiency: 'Beginner', rating: 1, isVerified: false }
      ];
    }

    // 6. Process professional bio summary
    const cleanBio = (bio || professionalSummary || '').trim();

    // 7. Create student user in MongoDB (Role is strictly 'student')
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      phone: (phone || '').trim(),
      location: (location || '').trim(),
      college: (college || '').trim(),
      degree: (degree || '').trim(),
      department: (department || '').trim(),
      academicYear: (academicYear || '').trim(),
      educationalBackground: finalBackground,
      targetCareer: finalCareer,
      careerInterest: finalCareer,
      bio: cleanBio || 'Dedicated student passionate about building real-world software and modern applications.',
      professionalSummary: cleanBio || 'Dedicated student passionate about building real-world software and modern applications.',
      skills: processedSkills
    });

    // 7. Also create individual Skill records in the Skill collection
    for (const sk of processedSkills) {
      try {
        await Skill.create({
          user: user._id,
          name: sk.name,
          normalizedName: sk.normalizedName,
          category: sk.category,
          proficiency: sk.proficiency,
          rating: sk.rating,
          isVerified: false
        });
      } catch (err) {
        // Silently continue if already exists
      }
    }

    // 8. Generate personalized roadmap tasks for the student based on target career
    try {
      await generateUserRoadmap(user._id, finalCareer);
    } catch (roadmapErr) {
      console.warn('Initial roadmap generation note:', roadmapErr.message);
    }

    // 9. Log account creation activity
    await Activity.create({
      user: user._id,
      text: 'Created student account and completed registration profile',
      icon: 'bi-person-badge',
      color: '#059669'
    });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to SkillForge.');
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during student registration.'
    });
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email and password.'
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Role Verification: When role selection is specified, enforce strict match
    const requestedRole = (req.body.role || '').trim().toLowerCase();
    if (requestedRole) {
      if (user.role !== requestedRole) {
        if (requestedRole === 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Access denied: This account is registered as a student. Please select Student Login to continue.'
          });
        } else if (requestedRole === 'student') {
          return res.status(403).json({
            success: false,
            message: 'Access denied: This account is registered as an administrator. Please select Admin Login to continue.'
          });
        }
      }
    }

    sendTokenResponse(user, 200, res, `Welcome, ${user.name}!`);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

/**
 * @desc    Get currently authenticated user details
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user session.'
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};
