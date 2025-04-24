require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../../models/Project');

async function checkProjectCount() {
  try {
    // Connect to MongoDB
    const config = require('../../config');
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Get current project count
    const projectCount = await Project.countDocuments();
    console.log(`Current project count: ${projectCount}`);
    
    // Disconnect from the database
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking project count:', error);
    process.exit(1);
  }
}

// Run the function
checkProjectCount(); 