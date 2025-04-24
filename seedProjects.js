const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
const config = require('./config');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// SRM Marrakech-Safi themed project data
const projectTypes = [
  // Water Services
  { 
    category: 'Eau', 
    titles: [
      'Installation de compteurs d\'eau intelligents à Marrakech',
      'Modernisation du réseau de distribution d\'eau à Safi',
      'Projet de dessalement d\'eau de mer pour la côte atlantique',
      'Extension du réseau d\'eau potable dans les zones rurales',
      'Optimisation des systèmes de traitement des eaux',
      'Rénovation des canalisations principales à Essaouira',
      'Amélioration de la qualité de l\'eau potable au Haouz',
      'Construction d\'un barrage collinaire près de Chichaoua',
      'Développement d\'un système de télégestion des réseaux d\'eau',
      'Réduction des pertes en eau dans le réseau de distribution',
      'Programme de sensibilisation à l\'économie d\'eau',
      'Contrôle de la qualité des eaux souterraines',
      'Gestion intelligente des ressources en eau'
    ]
  },
  // Electricity Services
  { 
    category: 'Électricité', 
    titles: [
      'Déploiement de compteurs électriques intelligents',
      'Extension du réseau électrique dans les zones rurales',
      'Installation de panneaux solaires dans les bâtiments administratifs',
      'Modernisation des postes de transformation à Marrakech',
      'Développement d\'un parc éolien à Essaouira',
      'Optimisation de la consommation électrique des installations',
      'Mise à niveau du réseau de distribution électrique à Safi',
      'Programme d\'électrification rurale durable',
      'Intégration des énergies renouvelables au réseau',
      'Maintenance préventive des infrastructures électriques',
      'Réduction des pertes techniques sur le réseau',
      'Sécurisation des installations électriques sensibles',
      'Amélioration de l\'efficacité énergétique des pompes'
    ]
  },
  // Sanitation Services
  { 
    category: 'Assainissement', 
    titles: [
      'Extension du réseau d\'assainissement à Marrakech Nord',
      'Construction d\'une station d\'épuration à Safi',
      'Réhabilitation des canalisations d\'assainissement à El Jadida',
      'Gestion des boues d\'épuration et valorisation',
      'Traitement des eaux usées pour l\'irrigation agricole',
      'Séparation des réseaux pluviaux et d\'eaux usées',
      'Modernisation des systèmes de pompage des eaux usées',
      'Cartographie numérique du réseau d\'assainissement',
      'Réduction des déversements non traités dans les cours d\'eau',
      'Contrôle des rejets industriels dans le réseau',
      'Amélioration des systèmes de drainage urbain',
      'Entretien préventif des infrastructures d\'assainissement',
      'Développement d\'un système de surveillance de la qualité des rejets'
    ]
  }
];

// Generate random dates
const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Define status options with French translations
const statusOptions = ['Non démarré', 'En cours', 'En attente', 'Terminé'];

// Generate realistic project descriptions
const generateDescription = (title, category) => {
  const commonDescriptions = [
    `Ce projet vise à améliorer les services de ${category.toLowerCase()} dans la région de Marrakech-Safi, en accord avec la stratégie de développement durable de la SRM.`,
    `Dans le cadre du plan d'amélioration des infrastructures de ${category.toLowerCase()}, ce projet permettra d'optimiser les ressources et d'améliorer la qualité du service aux usagers.`,
    `Projet prioritaire pour la modernisation des infrastructures de ${category.toLowerCase()} dans la région, avec un fort impact sur la qualité de service et la satisfaction des clients.`,
    `Ce projet s'inscrit dans la vision stratégique 2025 de la SRM Marrakech-Safi pour des services de ${category.toLowerCase()} plus durables et efficaces.`,
    `Initiative importante pour le développement des infrastructures de ${category.toLowerCase()} de la région, avec des bénéfices attendus tant pour les usagers que pour l'environnement.`
  ];
  
  // Add specific details based on category
  let specificDetails = '';
  if (category === 'Eau') {
    specificDetails = 'Le projet comprend des analyses de qualité, des travaux de modernisation des infrastructures, et la mise en place de systèmes de contrôle avancés pour garantir un service d\'eau potable fiable et de qualité.';
  } else if (category === 'Électricité') {
    specificDetails = 'Les travaux incluent le renforcement du réseau électrique, l\'installation d\'équipements modernes, et l\'intégration de solutions intelligentes pour une meilleure gestion de l\'énergie et une réduction des coupures.';
  } else if (category === 'Assainissement') {
    specificDetails = 'Le projet prévoit des interventions sur les réseaux d\'assainissement, l\'amélioration des capacités de traitement, et la mise aux normes environnementales pour une meilleure protection des écosystèmes locaux.';
  }
  
  const randomDescription = commonDescriptions[Math.floor(Math.random() * commonDescriptions.length)];
  return `${randomDescription} ${specificDetails}`;
};

// Comment templates
const commentTemplates = [
  "Les travaux avancent selon le planning prévu. Nous avons terminé la phase {phase} et nous préparons maintenant la suite.",
  "J'ai remarqué quelques problèmes avec {problème}. Je propose que nous organisions une réunion pour discuter des solutions possibles.",
  "Excellente progression sur ce projet. L'équipe a dépassé les objectifs fixés pour cette phase.",
  "Nous avons besoin de ressources supplémentaires pour {tâche}. Pouvons-nous en discuter lors de la prochaine réunion?",
  "Le fournisseur nous a informés d'un retard de livraison pour {équipement}. Cela pourrait impacter notre calendrier.",
  "Je suggère que nous modifiions notre approche concernant {aspect}. Cela pourrait nous faire gagner du temps et améliorer la qualité.",
  "Retour très positif des utilisateurs sur les premiers tests. La solution répond bien aux attentes.",
  "Suite à l'inspection sur site, nous avons identifié des ajustements nécessaires pour {composant}.",
  "Le budget est respecté jusqu'à présent. Les dépenses sont conformes aux prévisions.",
  "La formation des équipes sur le nouveau système est terminée. Tout le monde est prêt pour le déploiement.",
  "J'ai préparé un rapport détaillé sur l'avancement des travaux, disponible dans le dossier partagé.",
  "Des conditions météorologiques défavorables ont ralenti les travaux extérieurs. Nous ajustons le planning en conséquence."
];

// Problem and component placeholders for comments
const problemPlaceholders = [
  "la synchronisation des systèmes", "l'approvisionnement en matériaux", 
  "la configuration des équipements", "la coordination avec les sous-traitants",
  "la compatibilité des nouveaux composants", "les permis administratifs",
  "les tests de performance", "l'intégration des données"
];

const equipmentPlaceholders = [
  "les pompes principales", "les transformateurs", "les panneaux de contrôle", 
  "les capteurs de qualité", "les vannes automatisées", "les tableaux électriques",
  "les filtres spécialisés", "les compteurs intelligents"
];

const phaseNames = [
  "d'analyse préliminaire", "de conception détaillée", "d'approvisionnement", 
  "d'installation", "de test", "de formation", "de documentation",
  "de mise en service", "d'optimisation"
];

const aspectPlaceholders = [
  "la méthodologie de test", "le plan de communication", "le séquencement des travaux", 
  "la stratégie de déploiement", "la gestion des risques", "les critères de validation",
  "l'implication des usagers", "le monitoring des performances"
];

const componentPlaceholders = [
  "le système de filtration", "le réseau de distribution", "les installations de pompage", 
  "le système de contrôle", "les unités de traitement", "les dispositifs de sécurité",
  "les points de raccordement", "les interfaces utilisateur"
];

// Function to replace placeholders in comment templates
const generateComment = () => {
  const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
  
  return template
    .replace('{phase}', phaseNames[Math.floor(Math.random() * phaseNames.length)])
    .replace('{problème}', problemPlaceholders[Math.floor(Math.random() * problemPlaceholders.length)])
    .replace('{tâche}', aspectPlaceholders[Math.floor(Math.random() * aspectPlaceholders.length)])
    .replace('{équipement}', equipmentPlaceholders[Math.floor(Math.random() * equipmentPlaceholders.length)])
    .replace('{aspect}', aspectPlaceholders[Math.floor(Math.random() * aspectPlaceholders.length)])
    .replace('{composant}', componentPlaceholders[Math.floor(Math.random() * componentPlaceholders.length)]);
};

// Create admin and regular users for testing
const createUsers = async () => {
  console.log('Creating test users...');
  
  // Check if admin already exists
  const adminExists = await User.findOne({ email: 'admin@srm.ma' });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Admin SRM',
      email: 'admin@srm.ma',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin user created');
  }
  
  // Create regular users for comments
  const regularUsers = [
    { name: 'Mohamed Alami', email: 'mohamed.alami@srm.ma' },
    { name: 'Fatima Benkirane', email: 'fatima.benkirane@srm.ma' },
    { name: 'Ahmed Tazi', email: 'ahmed.tazi@srm.ma' },
    { name: 'Laila Fassi', email: 'laila.fassi@srm.ma' },
    { name: 'Karim Idrissi', email: 'karim.idrissi@srm.ma' },
    { name: 'Samira Alaoui', email: 'samira.alaoui@srm.ma' },
    { name: 'Hassan Mansouri', email: 'hassan.mansouri@srm.ma' },
    { name: 'Nadia Bennani', email: 'nadia.bennani@srm.ma' },
    { name: 'Youssef Chraibi', email: 'youssef.chraibi@srm.ma' },
    { name: 'Amina Zidane', email: 'amina.zidane@srm.ma' }
  ];
  
  const createdUsers = [];
  for (const user of regularUsers) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      const password = await bcrypt.hash('password123', 10);
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: password,
        role: 'user'
      });
      createdUsers.push(newUser);
      console.log(`User ${user.name} created`);
    } else {
      createdUsers.push(exists);
    }
  }
  
  return { admin: adminExists || await User.findOne({ email: 'admin@srm.ma' }), regularUsers: createdUsers };
};

// Create projects with comments
const createProjects = async (users) => {
  const { admin, regularUsers } = users;
  
  console.log('Creating projects...');
  
  // Get existing project count
  const existingCount = await Project.countDocuments();
  console.log(`Found ${existingCount} existing projects`);
  
  // Calculate how many new projects to create
  const projectsToCreate = Math.max(0, 39 - existingCount);
  console.log(`Creating ${projectsToCreate} new projects`);
  
  if (projectsToCreate <= 0) {
    console.log('Already have enough projects in the database');
    return;
  }
  
  // Create projects with different statuses and progress
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  // Distribute projects across categories
  const projects = [];
  for (let i = 0; i < projectsToCreate; i++) {
    const categoryIndex = i % projectTypes.length;
    const category = projectTypes[categoryIndex];
    
    // Pick a title from the category
    const titleIndex = Math.floor(Math.random() * category.titles.length);
    const title = category.titles[titleIndex];
    
    // Generate dates
    const startDate = generateRandomDate(oneYearAgo, now);
    const endDate = generateRandomDate(now, oneYearFromNow);
    
    // Generate random status and progress
    const statusIndex = Math.floor(Math.random() * statusOptions.length);
    const status = statusOptions[statusIndex];
    
    // Progress based on status
    let progress = 0;
    if (status === 'Completed') {
      progress = 100;
    } else if (status === 'In Progress') {
      progress = Math.floor(Math.random() * 70) + 20; // 20-90%
    } else if (status === 'On Hold') {
      progress = Math.floor(Math.random() * 60) + 10; // 10-70%
    } else {
      progress = Math.floor(Math.random() * 15); // 0-15%
    }
    
    // Create project
    const project = new Project({
      title,
      description: generateDescription(title, category.category),
      status,
      progress,
      startDate,
      endDate,
      createdBy: admin._id,
      // Assign 1-3 random users
      assignedTo: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
        const randomIndex = Math.floor(Math.random() * regularUsers.length);
        return regularUsers[randomIndex]._id;
      }),
      comments: []
    });
    
    // Add 5-10 comments to each project
    const commentCount = Math.floor(Math.random() * 6) + 5; // 5-10 comments
    for (let j = 0; j < commentCount; j++) {
      // Random user for comment
      const randomUserIndex = Math.floor(Math.random() * regularUsers.length);
      const commentUser = regularUsers[randomUserIndex];
      
      // Generate comment date between project start date and now
      const commentDate = generateRandomDate(startDate, now);
      
      project.comments.push({
        user: commentUser._id,
        content: generateComment(),
        createdAt: commentDate
      });
    }
    
    // Sort comments by date
    project.comments.sort((a, b) => a.createdAt - b.createdAt);
    
    projects.push(project);
  }
  
  // Save all projects
  await Project.insertMany(projects);
  console.log(`${projects.length} projects created`);
};

// Main function
const seedDatabase = async () => {
  try {
    // Create users first
    const users = await createUsers();
    
    // Then create projects with comments from these users
    await createProjects(users);
    
    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 