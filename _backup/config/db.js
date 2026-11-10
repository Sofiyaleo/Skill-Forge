/**
 * config/db.js
 * MongoDB Connection configuration using Mongoose.
 * 
 * This file handles connecting the Node.js application to the MongoDB database.
 * If the connection fails, it logs a clean error and exits the process.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern mongoose options are set by default
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
