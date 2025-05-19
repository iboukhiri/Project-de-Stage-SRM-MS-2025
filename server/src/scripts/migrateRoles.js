const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Migration mapping
    const roleMapping = {
      'admin': 'manager',     // Convert admin to manager
      'user': 'employee',     // Convert user to employee
      'superadmin': 'superadmin', // Keep superadmin as is
      'manager': 'manager',   // Keep manager as is
      'employee': 'employee'  // Keep employee as is
    };

    // Update each user
    for (const user of users) {
      const newRole = roleMapping[user.role] || 'employee'; // Default to employee if role not found
      
      if (user.role !== newRole) {
        console.log(`Migrating user ${user.email} from ${user.role} to ${newRole}`);
        user.role = newRole;
        await user.save();
      }
    }

    console.log('Role migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateRoles(); 