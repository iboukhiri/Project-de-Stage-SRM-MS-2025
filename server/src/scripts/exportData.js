const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// MongoDB connection string (adjust if needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

async function exportData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Get current timestamp for file naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Export Users
    console.log('Exporting Users...');
    const users = await User.find({}).lean();
    fs.writeFileSync(
      path.join(exportDir, `users_${timestamp}.json`),
      JSON.stringify(users, null, 2)
    );
    console.log(`Exported ${users.length} users`);

    // Export Projects with populated references
    console.log('Exporting Projects...');
    const projects = await Project.find({})
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .lean();
    fs.writeFileSync(
      path.join(exportDir, `projects_${timestamp}.json`),
      JSON.stringify(projects, null, 2)
    );
    console.log(`Exported ${projects.length} projects`);

    // Export Notifications with populated references
    console.log('Exporting Notifications...');
    const notifications = await Notification.find({})
      .populate('recipient', 'name email')
      .populate('sender', 'name email')
      .populate('relatedProject', 'title')
      .lean();
    fs.writeFileSync(
      path.join(exportDir, `notifications_${timestamp}.json`),
      JSON.stringify(notifications, null, 2)
    );
    console.log(`Exported ${notifications.length} notifications`);

    // Export complete database dump
    console.log('Creating complete database export...');
    const completeExport = {
      exportDate: new Date().toISOString(),
      collections: {
        users: users,
        projects: projects,
        notifications: notifications
      },
      summary: {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalNotifications: notifications.length
      }
    };
    
    fs.writeFileSync(
      path.join(exportDir, `complete_database_export_${timestamp}.json`),
      JSON.stringify(completeExport, null, 2)
    );

    console.log('\n=== Export Summary ===');
    console.log(`Users exported: ${users.length}`);
    console.log(`Projects exported: ${projects.length}`);
    console.log(`Notifications exported: ${notifications.length}`);
    console.log(`Export directory: ${exportDir}`);
    console.log(`Files created:`);
    console.log(`- users_${timestamp}.json`);
    console.log(`- projects_${timestamp}.json`);
    console.log(`- notifications_${timestamp}.json`);
    console.log(`- complete_database_export_${timestamp}.json`);

  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the export
exportData(); 