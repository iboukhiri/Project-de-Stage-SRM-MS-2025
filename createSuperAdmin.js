const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // First delete any existing superadmin
      await User.deleteOne({ email: 'superadmin@example.com' });
      console.log('Deleted existing superadmin if any');
      
      // Create user with plain password - the model's pre-save hook will hash it
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'password123', // Will be hashed by the pre-save hook
        role: 'superadmin'
      });
      
      // Save the user - this will trigger the pre-save hook that hashes the password
      await superAdmin.save();
      
      console.log('Super admin created successfully with these credentials:');
      console.log('Email: superadmin@example.com');
      console.log('Password: password123');
      console.log('Role: superadmin');
      
      // Test the password comparison
      const testPassword = 'password123';
      const isMatch = await superAdmin.comparePassword(testPassword);
      console.log(`Password verification test: ${isMatch ? 'PASSED' : 'FAILED'}`);
      
      mongoose.connection.close();
    } catch (error) {
      console.error('Error creating super admin:', error);
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 