const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const seedSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@example.com' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      mongoose.connection.close();
      return;
    }
    
    // Create hashed password
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
    console.log('Super admin created successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating super admin:', error);
    mongoose.connection.close();
  }
};

seedSuperAdmin(); 