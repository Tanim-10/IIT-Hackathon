// server/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Use MONGODB_URI (matching your env variable name)
    await mongoose.connect(process.env.MONGODB_URI); // Removed deprecated options
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;