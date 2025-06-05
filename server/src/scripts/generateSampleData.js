const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Generate sample data without connecting to database
async function generateSampleData() {
  try {
    console.log('Generating sample data...');

    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Get current timestamp for file naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Generate sample users with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const sampleUsers = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Ahmed Ben Ali',
        email: 'ahmed.benali@srm.com',
        password: hashedPassword,
        role: 'superadmin',
        createdAt: new Date('2024-01-15T08:00:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Fatima Ouali',
        email: 'fatima.ouali@srm.com',
        password: hashedPassword,
        role: 'manager',
        createdAt: new Date('2024-01-20T09:30:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Mohamed Trabelsi',
        email: 'mohamed.trabelsi@srm.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date('2024-02-01T10:15:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Amina Khelifi',
        email: 'amina.khelifi@srm.com',
        password: hashedPassword,
        role: 'employee',
        createdAt: new Date('2024-02-05T11:45:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Youssef Gharbi',
        email: 'youssef.gharbi@srm.com',
        password: hashedPassword,
        role: 'employee',
        createdAt: new Date('2024-02-10T14:20:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Leila Mansouri',
        email: 'leila.mansouri@srm.com',
        password: hashedPassword,
        role: 'user',
        createdAt: new Date('2024-02-15T16:30:00Z')
      }
    ];

    // Generate sample projects
    const sampleProjects = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Migration Système ERP',
        description: 'Migration complète du système ERP vers une nouvelle plateforme cloud pour améliorer les performances et la scalabilité.',
        status: 'En cours',
        progress: 65,
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-06-30T00:00:00Z'),
        createdBy: sampleUsers[0]._id,
        assignedTo: [sampleUsers[2]._id, sampleUsers[3]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[2]._id,
            content: 'Phase de test en cours, migration des données terminée à 80%',
            createdAt: new Date('2024-03-10T10:30:00Z'),
            updatedAt: null
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[0]._id,
            content: 'Excellent travail, continuez sur cette lancée',
            createdAt: new Date('2024-03-11T14:45:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2024-01-15T08:00:00Z'),
        updatedAt: new Date('2024-03-11T14:45:00Z'),
        guaranteeMonths: 12,
        guaranteeEndDate: null
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Développement Application Mobile',
        description: 'Création d\'une application mobile native pour iOS et Android permettant aux clients d\'accéder aux services SRM.',
        status: 'En attente',
        progress: 25,
        startDate: new Date('2024-02-01T00:00:00Z'),
        endDate: new Date('2024-08-15T00:00:00Z'),
        createdBy: sampleUsers[1]._id,
        assignedTo: [sampleUsers[4]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[4]._id,
            content: 'Prototype de l\'interface utilisateur finalisé, en attente de validation client',
            createdAt: new Date('2024-02-20T16:20:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2024-02-01T09:30:00Z'),
        updatedAt: new Date('2024-02-20T16:20:00Z'),
        guaranteeMonths: 6,
        guaranteeEndDate: null
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Mise à jour Sécurité Infrastructure',
        description: 'Renforcement de la sécurité informatique avec mise en place de nouveaux pare-feu et systèmes de détection d\'intrusion.',
        status: 'Terminé',
        progress: 100,
        startDate: new Date('2023-11-01T00:00:00Z'),
        endDate: new Date('2024-01-31T00:00:00Z'),
        createdBy: sampleUsers[0]._id,
        assignedTo: [sampleUsers[2]._id, sampleUsers[3]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[2]._id,
            content: 'Installation terminée, tests de pénétration réussis',
            createdAt: new Date('2024-01-25T13:15:00Z'),
            updatedAt: null
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[0]._id,
            content: 'Projet livré dans les temps, excellent travail d\'équipe',
            createdAt: new Date('2024-01-31T17:00:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2023-11-01T10:00:00Z'),
        updatedAt: new Date('2024-01-31T17:00:00Z'),
        guaranteeMonths: 24,
        guaranteeEndDate: new Date('2026-01-31T00:00:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Formation Équipe Développement',
        description: 'Programme de formation continue pour l\'équipe de développement sur les nouvelles technologies et méthodologies agiles.',
        status: 'Non démarré',
        progress: 0,
        startDate: new Date('2024-04-01T00:00:00Z'),
        endDate: new Date('2024-07-31T00:00:00Z'),
        createdBy: sampleUsers[1]._id,
        assignedTo: [sampleUsers[3]._id, sampleUsers[4]._id, sampleUsers[5]._id],
        comments: [],
        createdAt: new Date('2024-03-01T11:30:00Z'),
        updatedAt: new Date('2024-03-01T11:30:00Z'),
        guaranteeMonths: 0,
        guaranteeEndDate: null
      }
    ];

    // Generate sample notifications
    const sampleNotifications = [
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[2]._id,
        sender: sampleUsers[0]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Migration Système ERP"',
        relatedProject: sampleProjects[0]._id,
        read: true,
        date: new Date('2024-01-15T08:30:00Z'),
        metadata: { projectTitle: 'Migration Système ERP' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[3]._id,
        sender: sampleUsers[0]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Migration Système ERP"',
        relatedProject: sampleProjects[0]._id,
        read: true,
        date: new Date('2024-01-15T08:31:00Z'),
        metadata: { projectTitle: 'Migration Système ERP' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[0]._id,
        sender: sampleUsers[2]._id,
        type: 'comment',
        content: 'Nouveau commentaire sur le projet "Migration Système ERP"',
        relatedProject: sampleProjects[0]._id,
        read: false,
        date: new Date('2024-03-10T10:35:00Z'),
        metadata: { projectTitle: 'Migration Système ERP', commentPreview: 'Phase de test en cours...' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[4]._id,
        sender: sampleUsers[1]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Développement Application Mobile"',
        relatedProject: sampleProjects[1]._id,
        read: true,
        date: new Date('2024-02-01T10:00:00Z'),
        metadata: { projectTitle: 'Développement Application Mobile' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[1]._id,
        sender: sampleUsers[4]._id,
        type: 'progress_milestone',
        content: 'Le projet "Développement Application Mobile" a atteint 25% de progression',
        relatedProject: sampleProjects[1]._id,
        read: false,
        date: new Date('2024-02-20T16:25:00Z'),
        metadata: { projectTitle: 'Développement Application Mobile', progress: 25 }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[2]._id,
        sender: null,
        type: 'deadline_approaching',
        content: 'Le projet "Migration Système ERP" arrive à échéance dans 3 mois',
        relatedProject: sampleProjects[0]._id,
        read: false,
        date: new Date('2024-03-15T09:00:00Z'),
        metadata: { projectTitle: 'Migration Système ERP', daysLeft: 90 }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[3]._id,
        sender: sampleUsers[1]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Formation Équipe Développement"',
        relatedProject: sampleProjects[3]._id,
        read: false,
        date: new Date('2024-03-01T11:35:00Z'),
        metadata: { projectTitle: 'Formation Équipe Développement' }
      }
    ];

    // Save individual files
    fs.writeFileSync(
      path.join(exportDir, `sample_users_${timestamp}.json`),
      JSON.stringify(sampleUsers, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, `sample_projects_${timestamp}.json`),
      JSON.stringify(sampleProjects, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, `sample_notifications_${timestamp}.json`),
      JSON.stringify(sampleNotifications, null, 2)
    );

    // Create complete sample database export
    const completeSampleExport = {
      exportDate: new Date().toISOString(),
      dataType: 'sample_data',
      collections: {
        users: sampleUsers,
        projects: sampleProjects,
        notifications: sampleNotifications
      },
      summary: {
        totalUsers: sampleUsers.length,
        totalProjects: sampleProjects.length,
        totalNotifications: sampleNotifications.length
      },
      instructions: {
        usage: 'This file contains sample data that can be imported into the database',
        defaultPassword: 'password123',
        userRoles: ['superadmin', 'manager', 'admin', 'employee', 'user'],
        projectStatuses: ['Non démarré', 'En cours', 'En attente', 'Terminé', 'En garantie']
      }
    };

    fs.writeFileSync(
      path.join(exportDir, `complete_sample_database_${timestamp}.json`),
      JSON.stringify(completeSampleExport, null, 2)
    );

    console.log('\n=== Sample Data Generation Complete ===');
    console.log(`Sample Users generated: ${sampleUsers.length}`);
    console.log(`Sample Projects generated: ${sampleProjects.length}`);
    console.log(`Sample Notifications generated: ${sampleNotifications.length}`);
    console.log(`Export directory: ${exportDir}`);
    console.log(`Files created:`);
    console.log(`- sample_users_${timestamp}.json`);
    console.log(`- sample_projects_${timestamp}.json`);
    console.log(`- sample_notifications_${timestamp}.json`);
    console.log(`- complete_sample_database_${timestamp}.json`);
    console.log('\nDefault password for all users: password123');
    console.log('User roles: superadmin, manager, admin, employee, user');

  } catch (error) {
    console.error('Sample data generation failed:', error);
  }
}

// Run the sample data generation
generateSampleData(); 