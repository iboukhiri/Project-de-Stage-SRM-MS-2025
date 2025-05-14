const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const config = require('./config');
const projectService = require('./utils/projectService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// Configure CORS to accept requests from any origin with credentials
app.use(cors({
  origin: '*', // Allow requests from any origin
  credentials: true // Allow cookies to be sent with requests
}));
app.use(express.json());

// Serve uploaded files - configure with proper headers for caching control
app.use('/uploads', (req, res, next) => {
  // Set headers to prevent aggressive caching of profile photos
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('MongoDB Connected...');
    
    // Vérifications au démarrage du serveur
    console.log('Exécution des vérifications des projets au démarrage...');
    
    // 1. Vérifier les phases de garantie
    projectService.checkAndUpdateGuaranteePhases()
      .then(result => {
        console.log(`Phases de garantie: ${result.projectsUpdated} projet(s) mis à jour.`);
        console.log(`- ${result.enteringGuarantee} projet(s) entrés en phase de garantie`);
        console.log(`- ${result.completedAfterGuarantee} projet(s) terminés après la fin de la garantie`);
      })
      .catch(err => {
        console.error('Erreur lors de la vérification des phases de garantie:', err);
      });
      
    // 2. Vérifier les jalons de progression
    projectService.checkProgressMilestones()
      .then(result => {
        console.log(`Jalons de progression: ${result.notificationsCreated} notification(s) créée(s).`);
      })
      .catch(err => {
        console.error('Erreur lors de la vérification des jalons de progression:', err);
      });
      
    // 3. Vérifier les échéances approchantes
    projectService.checkDeadlineApproaching()
      .then(result => {
        console.log(`Échéances approchantes: ${result.notificationsCreated} notification(s) créée(s).`);
      })
      .catch(err => {
        console.error('Erreur lors de la vérification des échéances approchantes:', err);
      });
      
    // 4. Vérifier les projets inactifs
    projectService.checkInactiveProjects()
      .then(result => {
        console.log(`Projets inactifs: ${result.notificationsCreated} notification(s) créée(s).`);
      })
      .catch(err => {
        console.error('Erreur lors de la vérification des projets inactifs:', err);
      });
  })
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 