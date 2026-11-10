/**
 * scripts/create-admin.js
 * Secure Administrator Account Provisioning & Verification Utility for SkillForge.
 * 
 * Capabilities:
 * 1. Checks whether an authorized admin account exists in MongoDB.
 * 2. Securely creates or updates an admin account using project's bcrypt password hashing.
 * 3. Never logs or exposes passwords or secrets.
 * 
 * Usage:
 * - Check status:
 *     node scripts/create-admin.js
 * 
 * - Provision or reset an admin account with custom credentials:
 *     node scripts/create-admin.js <email> <password> [fullName]
 *   or using environment variables:
 *     ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const emailRegex = /^\S+@\S+\.\S+$/;

async function manageAdminAccount() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge_db';

  try {
    await mongoose.connect(mongoUri);

    // Read parameters from CLI args or environment variables
    const args = process.argv.slice(2);
    const targetEmail = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const targetPassword = args[1] || process.env.ADMIN_PASSWORD || '';
    const targetName = args[2] || process.env.ADMIN_NAME || 'Faculty Administrator';

    // 1. If no credentials provided, inspect and report existing admin status
    if (!targetEmail || !targetPassword) {
      const existingAdmins = await User.find({ role: 'admin' }).select('name email role createdAt');

      if (existingAdmins.length === 0) {
        console.log('ℹ️  No administrator account found in database.');
        console.log('👉 To provision your first admin account, run:');
        console.log('   node scripts/create-admin.js <your-admin-email> <secure-password> [FullName]');
      } else {
        console.log(`✅ ${existingAdmins.length} authorized administrator account(s) found in database:`);
        existingAdmins.forEach(adm => {
          console.log(`   - Name: ${adm.name} | Email: ${adm.email} | Role: ${adm.role}`);
        });
        console.log('\n🔐 To reset or add an admin account, run:');
        console.log('   node scripts/create-admin.js <email> <newPassword> [FullName]');
      }

      await mongoose.disconnect();
      process.exit(0);
    }

    // 2. Validate email and password inputs
    if (!emailRegex.test(targetEmail)) {
      console.error('❌ Error: Please provide a valid email address format.');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (targetPassword.length < 6) {
      console.error('❌ Error: Admin password must be at least 6 characters long.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 3. Check if user already exists
    let user = await User.findOne({ email: targetEmail });

    if (user) {
      // Update existing user into an administrator with the new password
      user.name = targetName;
      user.password = targetPassword; // User model pre-save hook automatically hashes with bcrypt
      user.role = 'admin';
      await user.save();
      console.log(`✅ Administrator account updated successfully.`);
      console.log(`   Account: ${user.email} (Role: ${user.role})`);
    } else {
      // Create new administrator user
      user = await User.create({
        name: targetName,
        email: targetEmail,
        password: targetPassword, // Automatically hashed with bcrypt
        role: 'admin',
        phone: '+91 98765 00000',
        location: 'Administration Center',
        bio: 'SkillForge System Administrator with platform oversight authority.'
      });
      console.log(`✅ New administrator account provisioned successfully.`);
      console.log(`   Account: ${user.email} (Role: ${user.role})`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database error during admin provisioning:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

manageAdminAccount();
