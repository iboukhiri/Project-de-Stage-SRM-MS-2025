const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find superadmin
      const superAdmin = await User.findOne({ email: 'superadmin@example.com' });
      
      if (superAdmin) {
        console.log('Super admin found:');
        console.log({
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role,
          passwordLength: superAdmin.password ? superAdmin.password.length : 0
        });
      } else {
        console.log('Super admin not found!');
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