const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
require('dotenv').config();

async function seedDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing demo data (optional - remove if you want to keep existing data)
    console.log('Clearing existing demo data...');
    await User.deleteMany({ email: { $in: ['superadmin@demo.com', 'manager@demo.com', 'employee@demo.com'] } });
    await Project.deleteMany({ title: { $regex: /^DEMO - / } });

    // Create demo users
    console.log('Creating demo users...');
    
    const demoUsers = [
      {
        name: 'Admin Système',
        email: 'superadmin@demo.com',
        password: 'demo123', // This will be hashed automatically by the pre-save hook
        role: 'superadmin'
      },
      {
        name: 'Chef de Projet',
        email: 'manager@demo.com',
        password: 'demo123',
        role: 'manager'
      },
      {
        name: 'Employé Développeur',
        email: 'employee@demo.com',
        password: 'demo123',
        role: 'employee'
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log(`Created ${createdUsers.length} demo users successfully`);

    // Get user IDs for project assignments
    const superadmin = createdUsers.find(u => u.role === 'superadmin');
    const manager = createdUsers.find(u => u.role === 'manager');
    const employee = createdUsers.find(u => u.role === 'employee');

    // Create demo projects
    console.log('Creating demo projects...');
    
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setMonth(currentDate.getMonth() + 3);
    
    const pastDate = new Date();
    pastDate.setMonth(currentDate.getMonth() - 2);
    
    const demoProjects = [
      {
        title: 'DEMO - Développement Site Web E-commerce',
        description: 'Projet de développement d\'une plateforme e-commerce complète avec React.js et Node.js. Interface utilisateur moderne, système de paiement intégré, gestion des stocks et tableau de bord administrateur.',
        status: 'En cours',
        progress: 65,
        startDate: pastDate,
        endDate: futureDate,
        createdBy: manager._id,
        assignedTo: [employee._id, manager._id],
        guaranteeMonths: 12,
        comments: [
          {
            user: manager._id,
            content: 'Projet bien avancé, l\'interface utilisateur est presque terminée. Il reste à implémenter le système de paiement.',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
          },
          {
            user: employee._id,
            content: 'J\'ai terminé l\'intégration des API de paiement. Tests en cours.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          }
        ]
      },
      {
        title: 'DEMO - Application Mobile de Gestion RH',
        description: 'Développement d\'une application mobile native pour la gestion des ressources humaines. Fonctionnalités : pointage, demandes de congés, bulletin de paie, communication interne.',
        status: 'Terminé',
        progress: 100,
        startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        createdBy: superadmin._id,
        assignedTo: [employee._id, manager._id],
        guaranteeMonths: 6,
        comments: [
          {
            user: superadmin._id,
            content: 'Projet livré avec succès. Client très satisfait de l\'interface et des fonctionnalités.',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            user: manager._id,
            content: 'Formation des utilisateurs finaux programmée pour la semaine prochaine.',
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'DEMO - Système de Gestion Documentaire',
        description: 'Implémentation d\'un système de gestion électronique des documents (GED) avec recherche avancée, versioning, workflows d\'approbation et intégration cloud.',
        status: 'En attente',
        progress: 25,
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdBy: manager._id,
        assignedTo: [employee._id],
        guaranteeMonths: 18,
        comments: [
          {
            user: manager._id,
            content: 'Projet en attente de validation des spécifications techniques par le client.',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        title: 'DEMO - Dashboard Analytics en Temps Réel',
        description: 'Création d\'un tableau de bord analytique en temps réel pour le suivi des KPIs business. Intégration de multiples sources de données, visualisations interactives avec Chart.js.',
        status: 'Non démarré',
        progress: 0,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
        createdBy: superadmin._id,
        assignedTo: [manager._id, employee._id],
        guaranteeMonths: 24,
        comments: []
      },
      {
        title: 'DEMO - API RESTful pour IoT',
        description: 'Développement d\'une API RESTful robuste pour la gestion d\'appareils IoT. Authentification JWT, gestion des permissions, monitoring en temps réel, base de données optimisée.',
        status: 'En garantie',
        progress: 100,
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        createdBy: manager._id,
        assignedTo: [employee._id],
        guaranteeMonths: 12,
        comments: [
          {
            user: employee._id,
            content: 'API déployée en production. Performance excellente, 99.9% d\'uptime.',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          },
          {
            user: manager._id,
            content: 'Client demande une extension pour supporter plus d\'appareils. À prévoir pour Q2.',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    const createdProjects = await Project.insertMany(demoProjects);
    console.log(`Created ${createdProjects.length} demo projects successfully`);

    console.log('\n========================================');
    console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY! 🎉');
    console.log('========================================');
    console.log('\n📧 Demo Accounts Created:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ 🔹 Super Admin                         │');
    console.log('│   Email: superadmin@demo.com            │');
    console.log('│   Password: demo123                     │');
    console.log('│   Role: superadmin                      │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 🔹 Chef de Projet                      │');
    console.log('│   Email: manager@demo.com               │');
    console.log('│   Password: demo123                     │');
    console.log('│   Role: manager                         │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ 🔹 Employé                             │');
    console.log('│   Email: employee@demo.com              │');
    console.log('│   Password: demo123                     │');
    console.log('│   Role: employee                        │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n📊 Demo Projects Created:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ • Site Web E-commerce (En cours - 65%) │');
    console.log('│ • App Mobile RH (Terminé - 100%)       │');
    console.log('│ • Système GED (En attente - 25%)       │');
    console.log('│ • Dashboard Analytics (Non démarré)    │');
    console.log('│ • API IoT (En garantie - 100%)         │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n✅ You can now login with any of the demo accounts!');
    console.log('📍 Access the application at: http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seeding failed:', error);
    process.exit(1);
  }
}

seedDemo(); 