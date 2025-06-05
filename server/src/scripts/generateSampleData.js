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
        title: 'Extension Réseau Eau Potable - Marrakech',
        description: 'Extension et modernisation du réseau de distribution d\'eau potable dans les quartiers périphériques de Marrakech, incluant l\'installation de nouvelles canalisations, stations de pompage et compteurs intelligents.',
        status: 'En cours',
        progress: 65,
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-08-30T00:00:00Z'),
        createdBy: sampleUsers[0]._id,
        assignedTo: [sampleUsers[2]._id, sampleUsers[3]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[2]._id,
            content: 'Installation des canalisations principales terminée, travaux sur les branchements secondaires en cours. 15 km de réseau installés sur 23 km prévus.',
            createdAt: new Date('2024-03-10T10:30:00Z'),
            updatedAt: null
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[0]._id,
            content: 'Excellent progrès, les tests de pression sont conformes aux normes. Continuez sur cette lancée.',
            createdAt: new Date('2024-03-11T14:45:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2024-01-15T08:00:00Z'),
        updatedAt: new Date('2024-03-11T14:45:00Z'),
        guaranteeMonths: 24,
        guaranteeEndDate: null
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Centrale Électrique Solaire - Safi',
        description: 'Construction d\'une centrale photovoltaïque de 50 MW à Safi pour renforcer l\'approvisionnement électrique de la région et développer les énergies renouvelables.',
        status: 'En attente',
        progress: 35,
        startDate: new Date('2024-02-01T00:00:00Z'),
        endDate: new Date('2024-12-15T00:00:00Z'),
        createdBy: sampleUsers[1]._id,
        assignedTo: [sampleUsers[4]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[4]._id,
            content: 'Études d\'impact environnemental terminées et approuvées. En attente des autorisations finales pour la phase de construction.',
            createdAt: new Date('2024-02-20T16:20:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2024-02-01T09:30:00Z'),
        updatedAt: new Date('2024-02-20T16:20:00Z'),
        guaranteeMonths: 36,
        guaranteeEndDate: null
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Station de Traitement des Eaux - Youssoufia',
        description: 'Construction d\'une nouvelle station de traitement des eaux usées à Youssoufia avec une capacité de 25 000 m³/jour, incluant les équipements de traitement biologique et la valorisation des boues.',
        status: 'Terminé',
        progress: 100,
        startDate: new Date('2023-06-01T00:00:00Z'),
        endDate: new Date('2024-01-31T00:00:00Z'),
        createdBy: sampleUsers[0]._id,
        assignedTo: [sampleUsers[2]._id, sampleUsers[3]._id],
        comments: [
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[2]._id,
            content: 'Installation terminée et tests de mise en service réussis. Capacité de traitement conforme aux spécifications techniques.',
            createdAt: new Date('2024-01-25T13:15:00Z'),
            updatedAt: null
          },
          {
            _id: new mongoose.Types.ObjectId(),
            user: sampleUsers[0]._id,
            content: 'Projet livré dans les temps et dans le budget. Excellent travail d\'équipe, station opérationnelle depuis février 2024.',
            createdAt: new Date('2024-01-31T17:00:00Z'),
            updatedAt: null
          }
        ],
        createdAt: new Date('2023-06-01T10:00:00Z'),
        updatedAt: new Date('2024-01-31T17:00:00Z'),
        guaranteeMonths: 60,
        guaranteeEndDate: new Date('2029-01-31T00:00:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Modernisation Réseau Électrique - Marrakech-Safi',
        description: 'Programme de modernisation et digitalisation du réseau électrique moyenne tension reliant Marrakech à Safi, incluant l\'installation de compteurs intelligents et systèmes de télégestion.',
        status: 'Non démarré',
        progress: 0,
        startDate: new Date('2024-05-01T00:00:00Z'),
        endDate: new Date('2024-11-30T00:00:00Z'),
        createdBy: sampleUsers[1]._id,
        assignedTo: [sampleUsers[3]._id, sampleUsers[4]._id, sampleUsers[5]._id],
        comments: [],
        createdAt: new Date('2024-03-01T11:30:00Z'),
        updatedAt: new Date('2024-03-01T11:30:00Z'),
        guaranteeMonths: 18,
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
        content: 'Vous avez été assigné au projet "Extension Réseau Eau Potable - Marrakech"',
        relatedProject: sampleProjects[0]._id,
        read: true,
        date: new Date('2024-01-15T08:30:00Z'),
        metadata: { projectTitle: 'Extension Réseau Eau Potable - Marrakech' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[3]._id,
        sender: sampleUsers[0]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Extension Réseau Eau Potable - Marrakech"',
        relatedProject: sampleProjects[0]._id,
        read: true,
        date: new Date('2024-01-15T08:31:00Z'),
        metadata: { projectTitle: 'Extension Réseau Eau Potable - Marrakech' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[0]._id,
        sender: sampleUsers[2]._id,
        type: 'comment',
        content: 'Nouveau commentaire sur le projet "Extension Réseau Eau Potable - Marrakech"',
        relatedProject: sampleProjects[0]._id,
        read: false,
        date: new Date('2024-03-10T10:35:00Z'),
        metadata: { projectTitle: 'Extension Réseau Eau Potable - Marrakech', commentPreview: 'Installation des canalisations principales...' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[4]._id,
        sender: sampleUsers[1]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Centrale Électrique Solaire - Safi"',
        relatedProject: sampleProjects[1]._id,
        read: true,
        date: new Date('2024-02-01T10:00:00Z'),
        metadata: { projectTitle: 'Centrale Électrique Solaire - Safi' }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[1]._id,
        sender: sampleUsers[4]._id,
        type: 'progress_milestone',
        content: 'Le projet "Centrale Électrique Solaire - Safi" a atteint 35% de progression',
        relatedProject: sampleProjects[1]._id,
        read: false,
        date: new Date('2024-02-20T16:25:00Z'),
        metadata: { projectTitle: 'Centrale Électrique Solaire - Safi', progress: 35 }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[2]._id,
        sender: null,
        type: 'deadline_approaching',
        content: 'Le projet "Extension Réseau Eau Potable - Marrakech" arrive à échéance dans 5 mois',
        relatedProject: sampleProjects[0]._id,
        read: false,
        date: new Date('2024-03-15T09:00:00Z'),
        metadata: { projectTitle: 'Extension Réseau Eau Potable - Marrakech', daysLeft: 150 }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        recipient: sampleUsers[3]._id,
        sender: sampleUsers[1]._id,
        type: 'project_assignment',
        content: 'Vous avez été assigné au projet "Modernisation Réseau Électrique - Marrakech-Safi"',
        relatedProject: sampleProjects[3]._id,
        read: false,
        date: new Date('2024-03-01T11:35:00Z'),
        metadata: { projectTitle: 'Modernisation Réseau Électrique - Marrakech-Safi' }
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