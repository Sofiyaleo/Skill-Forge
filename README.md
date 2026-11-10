# SkillForge — Skill Development and Career Readiness Platform

[![SkillForge CI](https://img.shields.io/badge/SkillForge-Unified%20Application-4F46E5.svg)](https://github.com)
[![Tests](https://img.shields.io/badge/Test%20Suite-45%20Passed%20%7C%200%20Failed-10B981.svg)](scripts/test-runner.js)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20Bootstrap%205-0EA5E9.svg)](server.js)

SkillForge is a complete, centralized full-stack web application designed for college students and faculty administrators. It empowers students to record their skills, assess their proficiencies, explore industry-standard career roles, identify skill gaps deterministically, follow personalized milestone roadmaps, take verified assessments, showcase their project and certification portfolios, and generate an ATS-friendly, print-ready A4 resume.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **MongoDB** (running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI)

### 2. Installation
Open your terminal in the project directory:
```bash
npm install
```

### 3. Configure Environment Variables
Ensure `.env` exists in the root folder (pre-configured with local defaults):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillforge_db
JWT_SECRET=skillforge_super_secure_jwt_secret_key_2026_xyz
SESSION_SECRET=skillforge_session_secret_key_college_project_2026
NODE_ENV=development
```

### 4. Seed the Database
Populate the database with industry career roles, MCQ assessment questions, demo accounts, projects, certifications, and roadmap milestones:
```bash
npm run seed
```

### 5. Start the Application
```bash
npm start
```
Or with hot-reload during development:
```bash
npm run dev
```

Open your browser at: **[http://localhost:5000](http://localhost:5000)**

### 6. Run the Automated Test Suite
Execute the 15 comprehensive test groups covering all project requirements:
```bash
npm test
```

---

## 🔑 Demo Accounts

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@example.com` | `password123` | Dashboard, Skills, Career Explorer, Gap Analysis, Roadmap, Assessments, Portfolio, Resume Builder |
| **Admin** | `admin@skillforge.com` | `adminpassword123` | Platform Administration, Enrolled Students Management, Career Roles Catalog, Test Metrics |

*Note: You can also create brand-new student accounts using the redesigned 4-step registration wizard at `/register.html`.*

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Clean HTML5, Vanilla CSS3 (`public/css/styles.css`), Bootstrap 5.3.3, Bootstrap Icons, responsive layout with dark navy sidebar (`#0F172A`), white content cards, purple-to-indigo highlights (`#6366F1` / `#4F46E5`), and native print stylesheet (`@media print`) for A4 resume export.
- **Backend**: Node.js and Express.js REST API with clean MVC architecture (`routes/`, `controllers/`, `models/`, `services/`).
- **Database**: MongoDB with Mongoose object modeling, compound unique indexes (`user + normalizedName`), and relational integrity.
- **Authentication & Security**: Secure bcryptjs password hashing with salt rounds, JWT tokens + HTTP-only cookies, ownership verification on all student-scoped records, and server-side evaluation of quizzes without client answer leakage.

---

## 📋 Merged Features & Retained Elements

This unified codebase combines the strongest components from both original project versions:

### From Version 1 (Workspace Client Application)
- **Polished Visual Design System**: Dark navy sidebar (`#0F172A`), crisp white cards, modern SVG circular progress dials, Bootstrap 5 components, and smooth micro-interactions.
- **Vanilla JavaScript Client (`public/js/api.js`)**: Clean API client with automatic session management, JWT injection, and toast notifications.
- **Interactive Modals & Workspaces**: Full UI for Skills CRUD, Career Role exploration, Assessments with quiz dialogs, Project Portfolio management, and Live A4 Resume preview.

### From Version 2 (Engine & Benchmark Data)
- **Deterministic Skill-Gap Engine (`services/skillGapService.js`)**: Robust skill synonym matching, dual proficiency ranking (1–5 and Beginner-to-Expert string scales), and exact readiness calculation:
  $$\text{Readiness \%} = \left(\frac{\text{Matched Skills Count}}{\text{Total Required Skills}}\right) \times 100$$
- **Rule-Based Roadmap Generator (`services/roadmapService.js`)**: Derives milestone tasks directly from skill gaps. Missing skills generate **High Priority** tasks, and skills needing improvement generate **Medium Priority** tasks, with duplicate-task prevention.
- **Curated Dataset (`data/careers.js`, `data/questions.js`, `data/learningResources.js`)**: Industry benchmarks for 7 in-demand roles, question banks with server-evaluated answer keys, and targeted learning resources.
- **Automated Verification Suite (`scripts/test-runner.js`)**: End-to-end assertions ensuring authentication, authorization, data isolation, and business logic reliability.

---

## 🗑️ Complete Removal of Internship Tracker

As requested, the Internship Tracker module has been **100% removed** from the application:
1. **Frontend**: Deleted `public/internships.html`. Removed all Internship sidebar links, header links, and landing page mentions across all HTML pages.
2. **Backend**: Deleted `models/Application.js`, `controllers/applicationController.js`, and `routes/applicationRoutes.js`. Unmounted `/api/applications` from `server.js`.
3. **Database & Seed**: Cleaned out all internship collections and models from `seed.js` and `services/seedService.js`.
4. **Dashboard**: Replaced internship application cards with real-time **Learning Roadmap Milestones** progress.
5. **Testing**: Automated test suite explicitly asserts the absence of all internship files and route bindings.

---

## 📑 Core Modules Overview

1. **Home Page (`public/index.html`)**: Interactive hero, career journey steps, key features, platform stats, and call-to-action banners.
2. **Authentication (`controllers/authController.js`)**: 
   - **4-Step Registration Wizard (`public/register.html`)**:
     - *Step 1: Account Details* (Full Name, Email, Password, Confirm Password).
     - *Step 2: Academic Profile* (College/Institution, Degree/Course, Department/Specialization, Academic Year/Semester, Educational Background with custom fallback).
     - *Step 3: Current Skills* (Categorized skill selector with proficiency levels Beginner–Expert, custom unlisted skill addition, duplicate prevention).
     - *Step 4: Career Goal* (Target career selection).
   - **Secure Login (`public/login.html`)**: JWT session creation with role-based routing.
3. **Student Dashboard (`public/dashboard.html`)**: Real-time stats calculated dynamically from database records (no hard-coded statistics). Displays total recorded skills, career readiness percentage gauge, roadmap milestones completed, project counts, and recent activity timeline.
4. **Student Profile (`public/profile.html`)**: View and edit personal information, academic details, target career role, and skills inventory with instant category filtering and search.
5. **Skills Management**: Complete CRUD operations for student skills with proficiency level adjustments and duplicate prevention via MongoDB compound unique index.
6. **Career Explorer (`public/careers.html`)**: Interactive catalog of industry roles with responsibilities, required skills, average compensation, and a **"Set as My Target Career"** action that recalculates the roadmap.
7. **Skill-Gap Analysis (`public/gap-analysis.html`)**: Real-time comparison between student skills and career requirements. Classifies skills into **Matched**, **Needs Improvement**, and **Missing**, displaying the exact readiness formula.
8. **Personalized Learning Roadmap (`public/roadmap.html`)**: Prioritized weekly milestones generated from skill gaps with task completion checkboxes and an on-demand **"Regenerate Recommendations"** action.
9. **Assessments (`public/assessments.html`)**: Server-evaluated multiple choice assessments covering HTML/CSS, JavaScript, React, Node.js, and Data Structures. Answers are stripped from client payloads and verified badges are awarded on passing.
10. **Project Portfolio (`public/portfolio.html`)**: Full CRUD for projects including title, tech stack, GitHub repository, live demo URLs, status, and completion date.
11. **Certification Management (`public/portfolio.html#certifications`)**: Full CRUD for certifications including title, issuing organization, issue date, and credential verification links.
12. **Resume Builder (`public/resume-builder.html`)**: Live A4 preview automatically populated from the student's database records. Includes personal details, academic education, technical skills, projects, and certifications. Features one-click **Download PDF** / **Print** with dedicated print stylesheet.
13. **Admin Dashboard (`public/admin.html`)**: Strictly protected faculty control room to monitor student enrollments, manage user accounts, and curate the career roles catalog.

---

## 🧪 Automated Test Suite Results

Run `npm test` to execute the verification suite (`scripts/test-runner.js`):

```text
========================================================
  SKILLFORGE AUTOMATED VERIFICATION TEST SUITE
========================================================

Test 1: MongoDB Connection Initialization
  [PASS] Server successfully connects to MongoDB

Test 2: Student Registration with Academic Information & Hashing
  [PASS] Password securely hashed with bcrypt (never plaintext)
  [PASS] Student A record saved to MongoDB with ObjectId
  [PASS] College and academic fields saved correctly
  [PASS] Educational background saved correctly
  [PASS] Target career saved correctly during registration

Test 3: Duplicate Email Rejection
  [PASS] Duplicate email registration is strictly rejected by MongoDB unique constraint

Test 4: Password Verification & Authentication
  [PASS] Correct credentials successfully authenticated with bcrypt
  [PASS] Incorrect credentials rejected with authentication failure

Test 5: Skill Inventory & Duplicate Prevention
  [PASS] Student A initial skill created in database
  [PASS] Duplicate skill for the same student is prevented by compound unique index (user + normalizedName)

Test 6: Student Data Isolation & Ownership Boundaries
  [PASS] Student B cannot view Student A private skills (Strict query scoping by authenticated user ID)
  [PASS] Student B cannot delete Student A skill by ID injection
  [PASS] Student A private record remains intact after unauthorized attempt

Test 7: Profile Updates Persistence
  [PASS] Updated profile fields persist correctly in MongoDB

Test 8: Deterministic Skill-Gap Analysis
  [PASS] Total required skills equals career role requirements count
  [PASS] Matched skill detected (JavaScript Advanced meets requirement)
  [PASS] Needs Improvement detected (CSS Basic < Intermediate requirement)
  [PASS] Missing skill detected correctly
  [PASS] Readiness calculation formula strictly verified: 22% = (2/9) * 100

Test 9: Personalized Learning Roadmap Generation
  [PASS] Roadmap generated 7 milestones derived directly from skill gaps
  [PASS] Missing skills assigned High Priority with Not Started status
  [PASS] Task status update to In Progress persisted to MongoDB
  [PASS] Task status update to Completed persisted to MongoDB
  [PASS] Regenerating roadmap preserves existing tasks and avoids duplicate records

Test 10: Assessment Questions Sanitization & Server-Side Evaluation
  [PASS] Quiz questions sent to client have correct answers and explanations sanitized
  [PASS] Server calculates 100% (5/5) without client tampering
  [PASS] Assessment attempt result saved to MongoDB

Test 11: Project Portfolio CRUD Operations
  [PASS] Project created and saved to MongoDB
  [PASS] Project update persisted to MongoDB

Test 12: Certification Management CRUD Operations
  [PASS] Certification created and saved to MongoDB
  [PASS] Certification update persisted to MongoDB

Test 13: Resume Data Aggregation
  [PASS] Resume includes student personal information
  [PASS] Resume includes educational and academic information
  [PASS] Resume incorporates actual student skills from database
  [PASS] Resume incorporates student projects from database
  [PASS] Resume incorporates student certifications from database

Test 14: Administrator Authorization & Role Restrictions
  [PASS] Regular student is designated with role: student
  [PASS] Administrator is designated with role: admin
  [PASS] Student cannot acquire admin privileges through ordinary user flows

Test 15: Verification of Internship Tracker Complete Removal
  [PASS] Internship.js model file completely removed
  [PASS] Application.js model file completely removed
  [PASS] internships.html page completely removed from public/
  [PASS] applicationRoutes.js completely removed from routes/
  [PASS] server.js does not mount /api/applications

========================================================
TEST RESULTS: 45 PASSED, 0 FAILED
========================================================
```

---

## 🛡️ Security & Isolation

- **Authentication**: JWT token with expiration and HTTP-only cookie support.
- **Authorization**: Role-based access control (`student` vs `admin`) with middleware guards (`protect`, `authorize('admin')`).
- **Data Scoping**: Every private record (skills, projects, certifications, roadmaps, assessment results) queries with `{ user: req.user._id }`, preventing unauthorized cross-student reads, updates, or deletions.
- **Server-Side Evaluation**: Correct quiz options and explanations are evaluated strictly server-side and never broadcast to the browser prior to submission.
- **Credentials Protection**: Passwords hashed using bcryptjs with 10 salt rounds. `.env` file kept local and credentials are never hard-coded.
