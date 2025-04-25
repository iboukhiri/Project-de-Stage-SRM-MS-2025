module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/srm-project',
  jwtSecret: process.env.JWT_SECRET || 'srm-project-secret-key-2023',
  port: process.env.PORT || 5002
}; 