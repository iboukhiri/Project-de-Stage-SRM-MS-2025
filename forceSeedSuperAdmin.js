const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // First delete any existing superadmin
      await User.deleteOne({ email: 'superadmin@example.com' });
      console.log('Deleted existing superadmin if any');
      
      // Create hashed password - force creating a new one
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Create super admin user
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'superadmin'
      });
      
      await superAdmin.save();
      console.log('Super admin created successfully with these credentials:');
      console.log('Email: superadmin@example.com');
      console.log('Password: password123');
      console.log('Role: superadmin');
      
      // Check that the account was created correctly
      const checkAdmin = await User.findOne({ email: 'superadmin@example.com' });
      console.log('Verification:');
      console.log({
        id: checkAdmin._id,
        name: checkAdmin.name,
        email: checkAdmin.email,
        role: checkAdmin.role,
        passwordHash: checkAdmin.password.substring(0, 20) + '...'
      });
      
      mongoose.connection.close();
    } catch (error) {
      console.error('Error creating super admin:', error);
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 