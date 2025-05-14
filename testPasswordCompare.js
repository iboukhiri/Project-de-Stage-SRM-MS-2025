const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the superadmin user
      const user = await User.findOne({ email: 'superadmin@example.com' });
      
      if (!user) {
        console.error('Super admin account not found');
        mongoose.connection.close();
        return;
      }
      
      // Test raw bcrypt comparison
      const plainPassword = 'password123';
      console.log('Testing password comparison with:', plainPassword);
      console.log('Stored password hash:', user.password);
      
      // First try the User model's comparePassword method
      console.log('\nMethod 1: Using User model comparePassword method:');
      try {
        const isMatch = await user.comparePassword(plainPassword);
        console.log('Password match:', isMatch);
      } catch (err) {
        console.error('Error comparing with model method:', err);
      }
      
      // Then try direct bcrypt compare
      console.log('\nMethod 2: Using bcrypt.compare directly:');
      try {
        const isMatch = await bcrypt.compare(plainPassword, user.password);
        console.log('Password match:', isMatch);
      } catch (err) {
        console.error('Error comparing with bcrypt directly:', err);
      }
      
      // Create a new hash and test with that
      console.log('\nMethod 3: Creating a new hash and comparing:');
      try {
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(plainPassword, salt);
        console.log('New hash:', newHash);
        const isMatch = await bcrypt.compare(plainPassword, newHash);
        console.log('Password match with new hash:', isMatch);
      } catch (err) {
        console.error('Error testing with new hash:', err);
      }

      mongoose.connection.close();
    } catch (error) {
      console.error('Error:', error);
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 