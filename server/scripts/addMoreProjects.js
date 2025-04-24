require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../../models/Project');
const User = require('../../models/User');

// Project types
const projectTypes = {
  water: {
    category: 'Eau',
    titles: [
      'Extension du réseau d\'eau potable à Nouakchott Est',
      'Forage de puits dans la région de Hodh El Gharbi',
      'Réhabilitation du système d\'adduction d\'eau à Kiffa',
      'Construction de citernes de stockage à Nouadhibou',
      'Installation de pompes solaires dans la région du Trarza',
      'Projet de récupération d\'eau de pluie à Aleg',
      'Dessalement d\'eau de mer à Nouakchott',
      'Mise en place de fontaines publiques à Rosso'
    ]
  },
  electricity: {
    category: 'Électricité',
    titles: [
      'Électrification rurale dans la région du Brakna',
      'Installation de panneaux solaires à Aioun',
      'Extension du réseau électrique à Zouérat',
      'Mise en place d\'éoliennes à Nouakchott',
      'Rénovation de la centrale électrique d\'Atar',
      'Projet d\'énergie solaire pour écoles rurales',
      'Électrification par mini-réseaux à Boutilimit',
      'Modernisation du réseau électrique de Kaédi'
    ]
  },
  sanitation: {
    category: 'Assainissement',
    titles: [
      'Construction de latrines publiques à Sélibaby',
      'Projet de gestion des déchets solides à Nouakchott',
      'Drainage des eaux pluviales à Rosso',
      'Système d\'évacuation des eaux usées à Nouadhibou',
      'Aménagement de canaux d\'assainissement à Néma',
      'Construction d\'une station d\'épuration à Aleg',
      'Programme d\'hygiène communautaire à Tidjikja',
      'Réhabilitation du réseau d\'égouts à Akjoujt'
    ]
  }
};

// Sample locations for projects
const locations = [
  'Nouakchott', 'Nouadhibou', 'Rosso', 'Atar', 'Kaédi', 
  'Zouérat', 'Kiffa', 'Néma', 'Aleg', 'Akjoujt', 'Tidjikja'
];

// Generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Pre-written project descriptions
const projectDescriptions = [
  "Ce projet vise à améliorer l'accès aux services essentiels pour les populations locales. Il comprend plusieurs phases d'implémentation avec des objectifs spécifiques à chaque étape. L'équipe de projet travaillera en étroite collaboration avec les autorités locales pour assurer une mise en œuvre efficace.",
  "Initiative importante pour le développement durable de la région. Ce projet s'inscrit dans une vision à long terme et répondra aux besoins urgents de la communauté. Une attention particulière sera accordée à l'impact environnemental et social.",
  "Projet stratégique qui contribuera significativement à l'amélioration des conditions de vie des habitants. L'approche adoptée est participative et inclusive, permettant aux bénéficiaires de s'approprier les résultats du projet.",
  "Cette intervention répond à des besoins identifiés lors d'études préliminaires approfondies. La méthodologie proposée s'appuie sur les meilleures pratiques internationales adaptées au contexte local. Des formations seront dispensées pour renforcer les capacités des acteurs locaux.",
  "Projet innovant qui introduit des solutions techniques modernes et adaptées. Les activités prévues sont complémentaires et s'articulent autour d'objectifs clairement définis. Un système de suivi-évaluation rigoureux sera mis en place pour mesurer les progrès.",
  "Ce projet structurant vise à renforcer les infrastructures existantes tout en développant de nouvelles capacités. Il s'inscrit dans le cadre des politiques nationales de développement et contribue à atteindre plusieurs objectifs de développement durable.",
  "Initiative qui cible prioritairement les zones les plus vulnérables avec une approche différenciée selon les besoins spécifiques. Les technologies sélectionnées sont robustes et adaptées aux conditions climatiques locales.",
  "Projet multisectoriel qui favorise les synergies entre différentes interventions. La durabilité des résultats est au cœur de la conception, avec des mécanismes de maintenance et de gestion clairement définis."
];

async function addMoreProjects() {
  try {
    // Connect to MongoDB
    const config = require('../../config');
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Find existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found. Please run seedProjects.js first.');
      process.exit(1);
    }

    // Get current project count
    const projectCount = await Project.countDocuments();
    console.log(`Current project count: ${projectCount}`);
    
    // Set to add exactly 11 more projects
    const projectsToAdd = 11;
    
    console.log(`Adding ${projectsToAdd} more projects...`);

    // Find admin user for project creation
    const adminUser = users.find(user => user.role === 'admin') || users[0];

    // Statuses and their weights (for random selection)
    const statuses = [
      { name: 'À faire', weight: 3 },
      { name: 'En cours', weight: 5 },
      { name: 'En attente', weight: 2 },
      { name: 'Terminé', weight: 2 },
      { name: 'Annulé', weight: 1 }
    ];
    
    // Flatten statuses based on weights for random selection
    const weightedStatuses = statuses.flatMap(status => 
      Array(status.weight).fill(status.name)
    );

    // Priorities and their weights (for random selection)
    const priorities = [
      { name: 'Basse', weight: 3 },
      { name: 'Moyenne', weight: 5 },
      { name: 'Haute', weight: 2 },
      { name: 'Urgente', weight: 1 }
    ];
    
    // Flatten priorities based on weights for random selection
    const weightedPriorities = priorities.flatMap(priority => 
      Array(priority.weight).fill(priority.name)
    );

    // Create new projects
    for (let i = 0; i < projectsToAdd; i++) {
      // Select a random project type
      const projectTypeKeys = Object.keys(projectTypes);
      const randomTypeKey = projectTypeKeys[Math.floor(Math.random() * projectTypeKeys.length)];
      const projectType = projectTypes[randomTypeKey];
      
      // Select a random title from the project type
      const randomTitleIndex = Math.floor(Math.random() * projectType.titles.length);
      const projectTitle = `${projectType.titles[randomTitleIndex]} ${i + 1}`;
      
      // Get a random description
      const descriptionIndex = Math.floor(Math.random() * projectDescriptions.length);
      
      // Generate random dates
      const startDate = randomDate(new Date(2022, 0, 1), new Date(2023, 11, 31));
      let endDate = null;
      if (Math.random() > 0.3) { // 70% chance to have an end date
        endDate = randomDate(startDate, new Date(2024, 11, 31));
      }
      
      // Generate random status
      const randomStatus = weightedStatuses[Math.floor(Math.random() * weightedStatuses.length)];
      
      // Generate random priority
      const randomPriority = weightedPriorities[Math.floor(Math.random() * weightedPriorities.length)];
      
      // Get a random location
      const locationIndex = Math.floor(Math.random() * locations.length);
      
      // Create project
      const project = new Project({
        title: projectTitle,
        description: projectDescriptions[descriptionIndex],
        category: projectType.category,
        startDate,
        endDate,
        status: randomStatus,
        priority: randomPriority,
        budget: Math.floor(Math.random() * 1000000) + 50000, // Random budget between 50,000 and 1,050,000
        location: locations[locationIndex],
        createdBy: adminUser._id,
        assignedTo: users[Math.floor(Math.random() * users.length)]._id,
      });
      
      await project.save();
      console.log(`Project created: ${projectTitle}`);
    }
    
    console.log('Successfully added additional projects!');
    console.log(`New total project count: ${await Project.countDocuments()}`);
    
    // Disconnect from the database
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error adding projects:', error);
    process.exit(1);
  }
}

// Run the function
addMoreProjects(); 