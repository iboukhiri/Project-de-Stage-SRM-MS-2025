import axios from 'axios';
import config from '../config';

// Project themes based on company focus areas
const projectTypes = [
  // Water Services
  { 
    category: 'Eau', 
    titles: [
      'Modernisation du réseau de distribution d\'eau à Marrakech',
      'Réhabilitation des canalisations d\'eau à Safi',
      'Installation de compteurs intelligents dans le quartier Guéliz',
      'Extension du réseau d\'eau potable à Essaouira',
      'Système de détection de fuites à El Jadida',
      'Optimisation de la station de traitement de Tensift',
      'Projet de conservation d\'eau dans les zones agricoles'
    ]
  },
  // Electricity Services
  { 
    category: 'Électricité', 
    titles: [
      'Déploiement d\'éclairage LED sur les boulevards de Marrakech',
      'Installation de panneaux solaires sur les bâtiments administratifs',
      'Modernisation du réseau électrique à Safi',
      'Projet d\'efficacité énergétique pour les PME de la région',
      'Rénovation des lignes de transmission à Chichaoua',
      'Électrification rurale par énergie solaire dans la province d\'Essaouira',
      'Installation de bornes de recharge pour véhicules électriques'
    ]
  },
  // Sanitation Services
  { 
    category: 'Assainissement', 
    titles: [
      'Réhabilitation du réseau d\'assainissement à Marrakech-Médina',
      'Construction d\'une station d\'épuration à Tamansourt',
      'Mise à niveau du système de drainage à Essaouira',
      'Projet de gestion des déchets solides à El Kelâa des Sraghna',
      'Installation de collecteurs d\'eaux pluviales à Safi',
      'Amélioration des infrastructures d\'assainissement dans les zones rurales',
      'Modernisation du système de traitement des eaux usées à Benguerir'
    ]
  }
];

// Generate descriptions based on project category
const generateDescription = (category) => {
  const descriptions = {
    'Eau': [
      'Ce projet vise à améliorer la qualité et la fiabilité de la distribution d\'eau potable dans la région, avec un accent particulier sur la réduction des pertes et l\'optimisation des ressources disponibles.',
      'Initiative stratégique pour la modernisation des infrastructures d\'eau, ce projet répond aux besoins croissants de la population tout en assurant une gestion durable de la ressource hydrique.',
      'Projet prioritaire dans le cadre du plan directeur de l\'eau, cette intervention permettra d\'améliorer l\'accès à l\'eau potable et d\'optimiser le rendement du réseau de distribution.'
    ],
    'Électricité': [
      'Ce projet s\'inscrit dans la transition énergétique de la région, avec pour objectif de réduire la consommation d\'énergie et d\'améliorer la fiabilité du réseau électrique.',
      'Initiative innovante pour la modernisation du système électrique, ce projet intègre des solutions intelligentes pour une gestion optimisée de l\'énergie et une réduction des coûts opérationnels.',
      'Projet structurant visant à renforcer les infrastructures électriques de la région tout en favorisant l\'intégration des énergies renouvelables dans le mix énergétique local.'
    ],
    'Assainissement': [
      'Ce projet répond aux enjeux environnementaux majeurs de la région, avec pour objectif d\'améliorer la gestion des eaux usées et de réduire l\'impact sur les écosystèmes naturels.',
      'Initiative importante pour la santé publique et l\'environnement, ce projet modernise les infrastructures d\'assainissement et renforce les capacités de traitement des effluents.',
      'Projet stratégique s\'inscrivant dans le schéma directeur d\'assainissement, cette intervention permettra d\'améliorer les conditions sanitaires et de préserver les ressources en eau.'
    ]
  };
  
  return descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
};

// Comment templates for projects
const commentTemplates = [
  {
    title: "Rapport d'avancement",
    content: "Les travaux progressent conformément au planning établi. Nous avons terminé la phase {phase} avec succès et nous préparons maintenant la phase suivante. L'équipe est mobilisée et motivée."
  },
  {
    title: "Réception des travaux",
    content: "La réception des travaux de {composant} s'est déroulée aujourd'hui avec succès. Tous les tests sont conformes aux spécifications techniques du cahier des charges. Nous pouvons valider cette étape."
  },
  {
    title: "Coordination avec les parties prenantes",
    content: "La réunion de coordination avec les différentes parties prenantes a été très productive. Nous avons pu résoudre les problèmes liés à {problème} et définir clairement les prochaines étapes."
  },
  {
    title: "Livraison des équipements",
    content: "Les équipements pour {équipement} ont été livrés et installés sur site. Le fournisseur a assuré la formation de notre équipe technique. Le système est maintenant opérationnel."
  },
  {
    title: "Retours utilisateurs",
    content: "Suite aux premiers tests utilisateurs, nous avons recueilli des retours très positifs. Les améliorations apportées au {système} sont appréciées par l'ensemble des utilisateurs."
  },
  {
    title: "Finalisation du projet",
    content: "Tous les objectifs du projet ont été atteints. La documentation technique et les manuels d'utilisation ont été transmis au client. Le projet peut être considéré comme terminé avec succès."
  }
];

// Fill in placeholders for comments
const placeholders = {
  phase: ['d\'analyse', 'd\'installation', 'de test', 'de déploiement', 'de formation', 'd\'optimisation'],
  composant: ['réseau principal', 'système de contrôle', 'station de pompage', 'unité de traitement', 'infrastructure centrale', 'système de monitoring'],
  problème: ['accès au site', 'approvisionnement des matériaux', 'coordination des équipes', 'intégration des systèmes', 'conformité réglementaire'],
  équipement: ['compteurs intelligents', 'systèmes de filtration', 'panneaux solaires', 'pompes hydrauliques', 'transformateurs', 'stations de contrôle'],
  système: ['interface utilisateur', 'tableau de bord', 'système d\'alerte', 'plateforme de gestion', 'application mobile']
};

// Generate a random comment with filled placeholders
const generateComment = () => {
  const templateIndex = Math.floor(Math.random() * commentTemplates.length);
  let content = commentTemplates[templateIndex].content;
  
  // Replace all placeholders
  Object.keys(placeholders).forEach(placeholder => {
    const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
    if (content.match(regex)) {
      const replacementValue = placeholders[placeholder][Math.floor(Math.random() * placeholders[placeholder].length)];
      content = content.replace(regex, replacementValue);
    }
  });
  
  return {
    title: commentTemplates[templateIndex].title,
    content
  };
};

// Generate array of commenting user IDs
const getCommentUsers = (users, adminId) => {
  // Exclude admin from regular users
  const regularUsers = users.filter(user => user._id !== adminId);
  
  // Shuffle and take a subset
  const shuffled = [...regularUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(5, shuffled.length));
};

// Generate dates ending in current month
const generateProjectDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Create projects that end in the current month
  const endDate = new Date(currentYear, currentMonth, Math.floor(Math.random() * 28) + 1);
  
  // Start date is 2-6 months before end date
  const projectDuration = Math.floor(Math.random() * 4) + 2; // 2-6 months
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - projectDuration);
  
  return { startDate, endDate };
};

// Main function to add completed projects
export const addCompletedProjects = async (token) => {
  try {
    // Configure axios with token
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // 1. First, get all users to add as commenters
    const usersResponse = await axios.get(`${config.API_URL}/api/users`, axiosConfig);
    const users = usersResponse.data;
    
    if (!users || users.length < 3) {
      console.error('Not enough users found to create comments');
      return { success: false, message: 'Not enough users found' };
    }
    
    // Find admin user
    const adminUser = users.find(user => user.role === 'admin');
    if (!adminUser) {
      console.error('Admin user not found');
      return { success: false, message: 'Admin user not found' };
    }
    
    // Select commenting users
    const commentUsers = getCommentUsers(users, adminUser._id);
    
    // 2. Create 10 completed projects
    const createdProjects = [];
    
    for (let i = 0; i < 10; i++) {
      // Select random project type
      const categoryIndex = Math.floor(Math.random() * projectTypes.length);
      const category = projectTypes[categoryIndex].category;
      const titleOptions = projectTypes[categoryIndex].titles;
      const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
      
      // Generate description based on category
      const description = generateDescription(category);
      
      // Generate dates (ending in current month)
      const { startDate, endDate } = generateProjectDates();
      
      // Create project
      const projectData = {
        title,
        description,
        status: 'Terminé', // Completed status
        progress: 100, // 100% complete
        startDate,
        endDate,
        assignedTo: commentUsers.map(user => user._id) // Assign to same users who will comment
      };
      
      // Save project
      const projectResponse = await axios.post(
        `${config.API_URL}/api/projects`, 
        projectData, 
        axiosConfig
      );
      
      const project = projectResponse.data;
      
      // 3. Add at least 3 comments to each project
      const commentCount = Math.floor(Math.random() * 3) + 3; // 3-5 comments
      
      for (let j = 0; j < commentCount; j++) {
        // Select random user to comment
        const commentUser = commentUsers[j % commentUsers.length];
        
        // Generate comment
        const comment = generateComment();
        
        // Create comment configuration with the commenter's token
        const commentConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Add comment
        await axios.post(
          `${config.API_URL}/api/projects/${project._id}/comments`,
          { content: `**${comment.title}**: ${comment.content}` },
          commentConfig
        );
      }
      
      createdProjects.push(project);
    }
    
    return { 
      success: true, 
      message: `${createdProjects.length} projects have been created successfully`,
      projects: createdProjects
    };
    
  } catch (error) {
    console.error('Error adding completed projects:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message 
    };
  }
};

export default addCompletedProjects; 