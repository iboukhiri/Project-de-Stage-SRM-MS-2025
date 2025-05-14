const axios = require('axios');
const config = require('./config');

const testLogin = async () => {
  try {
    console.log('Attempting to login with superadmin credentials');
    console.log('API URL:', `${config.port ? `http://localhost:${config.port}` : 'http://localhost:5002'}/api/auth/login`);
    
    const response = await axios.post(`${config.port ? `http://localhost:${config.port}` : 'http://localhost:5002'}/api/auth/login`, {
      email: 'superadmin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', response.data.user);
    console.log('Token received:', response.data.token ? 'Yes (token hidden)' : 'No');
  } catch (error) {
    console.error('Login failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Full error details:', error.response?.data || error.message || error);
  }
};

// Start the test
testLogin(); 