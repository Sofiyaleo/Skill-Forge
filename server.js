/**
 * server.js
 * Main entry point for the SkillForge Express application.
 * 
 * - Loads environment variables (.env)
 * - Connects to MongoDB via config/db.js
 * - Registers middleware (JSON body parser, cookie parser, static files)
 * - Registers API routes
 * - Serves frontend files from the public/ folder
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express app
const app = express();

// 4. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Serve static files from 'public' directory (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// 6. Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// Base API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillForge API is online and operational.',
    timestamp: new Date().toISOString()
  });
});

// 7. Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// 8. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 9. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SkillForge server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your web browser`);
});
