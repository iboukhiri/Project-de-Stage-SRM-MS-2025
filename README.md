========================================================================
#                      PROJET DE STAGE SRM-MS 2025                     #
========================================================================

<div align="center">

![SRM Logo](https://img.shields.io/badge/SRM-Suivi%20de%20Projet-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

</div>

# 📋 Système de Suivi de Projet SRM

Une application moderne et robuste de gestion de projet construite avec la pile MERN (MongoDB, Express.js, React, Node.js), conçue spécifiquement pour le suivi et la gestion efficace des projets avec des fonctionnalités avancées de visualisation, un système de notifications en temps réel et un contrôle d'accès basé sur les rôles.

## 🎯 Objectifs du Projet

Ce système a été développé dans le cadre d'un projet de stage pour répondre aux besoins spécifiques de gestion de projet, offrant une solution complète qui permet :
- Le suivi détaillé de l'avancement des projets
- La collaboration efficace entre les équipes
- La visualisation des données de performance
- La gestion des ressources et des échéances

## 🚀 Fonctionnalités Principales

### 📊 Tableau de Bord & Visualisation
- **Tableau de bord interactif** avec des statistiques de projet en temps réel
- **Visualisations avancées** : graphiques de progression, diagrammes en secteurs, courbes de tendances
- **Métriques personnalisables** : taux d'achèvement, analyse de performance, indicateurs KPI
- **Rapports exportables** au format PDF et Excel
- **Filtres dynamiques** par période, statut, responsable

### 📝 Gestion Complète de Projet
- **Cycle de vie complet** : création, planification, exécution, suivi, clôture
- **Statuts personnalisables** : En attente, En cours, En révision, Terminé, Annulé
- **Suivi de garantie** avec alertes automatiques d'expiration
- **Gestion des échéances** et notifications préventives
- **Attribution des responsabilités** et suivi des tâches
- **Historique détaillé** de toutes les modifications

### 💬 Collaboration & Communication
- **Système de commentaires hiérarchique** basé sur les rôles
- **Mentions (@)** pour notifier les utilisateurs spécifiques
- **Notifications en temps réel** pour toutes les activités
- **Modification et suppression** des commentaires avec permissions appropriées
- **Discussions contextuelles** attachées aux projets
- **Système de révision** pour validation des livrables

### 👥 Gestion Avancée des Utilisateurs
- **Contrôle d'accès granulaire** avec 4 niveaux de rôles :
  - **Super Admin** : Accès total, gestion système, configuration globale
  - **Manager** : Supervision de multiples projets, gestion d'équipe
  - **Employé** : Travail sur projets assignés, mise à jour des tâches
  - **Utilisateur** : Accès consultation, commentaires limités
- **Profils utilisateur détaillés** avec photos et informations
- **Suivi d'activité** et journaux d'audit complets
- **Gestion des permissions** par projet et par fonctionnalité

### 🔔 Système de Notifications Intelligent
- **Notifications push** en temps réel dans l'interface
- **Alertes d'échéances** configurables (1 jour, 3 jours, 1 semaine avant)
- **Notifications de progression** pour les étapes importantes
- **Rappels automatiques** pour les tâches en retard
- **Alertes de commentaires** et mentions
- **Notifications personnalisables** selon les préférences utilisateur

### 🌓 Expérience Utilisateur Optimisée
- **Design responsive** adaptatif pour mobile, tablette et desktop
- **Mode sombre/clair** avec sauvegarde des préférences
- **Interface Material-UI moderne** et intuitive
- **Performance optimisée** avec lazy loading et mise en cache
- **Accessibilité** conforme aux standards WCAG
- **Recherche intelligente** avec filtres avancés

## 🏗️ Architecture Technique

### 🎨 Frontend (Client)
```
Technologies utilisées :
- React.js 19.1.0 avec Hooks et Context API
- Material-UI 7.0.2 pour l'interface utilisateur
- Chart.js 4.4.9 pour les visualisations de données
- Axios 1.8.4 pour les appels API
- React Router DOM 7.5.1 pour la navigation
- Date-fns 4.1.0 pour la gestion des dates
```

### ⚙️ Backend (Serveur)
```
Technologies utilisées :
- Node.js avec Express.js 4.18.2
- MongoDB avec Mongoose ODM 7.5.0
- JWT pour l'authentification sécurisée
- Bcrypt.js pour le hachage des mots de passe
- Multer pour la gestion des fichiers
- Node-cron pour les tâches programmées
- CORS pour la sécurité cross-origin
```

## 📁 Structure du Projet

```
Project-de-Stage-SRM-MS-2025/
├── 📂 client/                          # Application Frontend React
│   ├── 📂 public/                      # Fichiers statiques
│   ├── 📂 src/
│   │   ├── 📂 components/              # Composants React réutilisables
│   │   │   ├── 📂 admin/               # Composants administration
│   │   │   ├── 📂 auth/                # Authentification et autorisation
│   │   │   ├── 📂 common/              # Composants partagés
│   │   │   ├── 📂 dashboard/           # Tableau de bord et analytics
│   │   │   ├── 📂 layout/              # Mise en page et navigation
│   │   │   ├── 📂 projects/            # Gestion des projets
│   │   │   └── 📂 routing/             # Configuration des routes
│   │   ├── 📂 context/                 # Context API pour l'état global
│   │   ├── 📂 styles/                  # Styles CSS et thèmes
│   │   ├── 📂 utils/                   # Fonctions utilitaires
│   │   ├── 📄 App.js                   # Composant principal
│   │   └── 📄 index.js                 # Point d'entrée React
│   └── 📄 package.json                 # Dépendances frontend
├── 📂 server/                          # Application Backend Node.js
│   ├── 📂 src/
│   │   ├── 📂 middleware/              # Middlewares Express
│   │   ├── 📂 models/                  # Modèles de données MongoDB
│   │   ├── 📂 routes/                  # Routes API RESTful
│   │   ├── 📂 scripts/                 # Scripts d'automatisation
│   │   ├── 📂 utils/                   # Utilitaires serveur
│   │   ├── 📄 server.js                # Serveur principal Express
│   │   └── 📄 config.js                # Configuration base de données
│   └── 📄 package.json                 # Dépendances backend
├── 📂 uploads/                         # Fichiers téléchargés
├── 📄 package.json                     # Configuration principale
├── 📄 README.md                        # Documentation du projet
└── 📄 rapport_stage_srm_ms.txt         # Rapport de stage
```

## 🔧 Installation et Configuration

### 📋 Prérequis Système

Avant de commencer l'installation, assurez-vous d'avoir les éléments suivants installés sur votre système :

- **Node.js** (version 14.0.0 ou supérieure) - [Télécharger](https://nodejs.org/)
- **MongoDB** (version 4.4 ou supérieure) - [Télécharger](https://www.mongodb.com/try/download/community)
- **npm** ou **yarn** (gestionnaire de paquets)
- **Git** (pour cloner le repository)

### ⬇️ Installation Étape par Étape

#### 1. Cloner le Repository
```bash
git clone https://github.com/your-username/srm-project-tracker.git
cd Project-de-Stage-SRM-MS-2025
```

#### 2. Configuration de la Base de Données
```bash
# Démarrer MongoDB (sur Windows)
net start MongoDB

# Démarrer MongoDB (sur macOS/Linux)
sudo systemctl start mongod

# Créer la base de données (optionnel, sera créée automatiquement)
mongo
> use srm_project_db
> exit
```

#### 3. Installation des Dépendances Backend
```bash
# Installer les dépendances du serveur
npm install

# Ou si vous préférez yarn
yarn install
```

#### 4. Installation des Dépendances Frontend
```bash
# Naviguer vers le dossier client
cd client

# Installer les dépendances du client
npm install

# Retourner au dossier racine
cd ..
```

#### 5. Configuration de l'Environnement
Créez un fichier `.env` dans le dossier racine avec les variables suivantes :

```env
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/srm_project_db
DB_NAME=srm_project_db

# Configuration JWT
JWT_SECRET=votre_clé_secrète_très_sécurisée_ici
JWT_EXPIRE=7d

# Configuration Serveur
PORT=5000
NODE_ENV=development

# Configuration Client
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Configuration Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application
```

## 🚀 Démarrage de l'Application

### 🏃‍♂️ Démarrage Rapide (Mode Développement)
```bash
# Démarrer simultanément le serveur et le client
npm run dev:full
```

### 🔄 Démarrage Séparé

#### Backend uniquement :
```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start
```

#### Frontend uniquement :
```bash
# Dans un nouveau terminal
npm run client
```

L'application sera accessible aux adresses suivantes :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Base de données** : mongodb://localhost:27017

## 📖 Guide d'Utilisation

### 🔐 Première Connexion

1. **Accédez à l'application** : Ouvrez votre navigateur et allez sur `http://localhost:3000`

2. **Créer un compte administrateur** :
   - Cliquez sur "S'inscrire"
   - Remplissez les informations requises
   - Le premier utilisateur créé aura automatiquement les droits Super Admin

3. **Connexion** :
   - Utilisez vos identifiants pour vous connecter
   - Vous serez redirigé vers le tableau de bord

### 🎛️ Navigation dans l'Interface

#### Tableau de Bord Principal
- **Vue d'ensemble** : Statistiques globales des projets
- **Graphiques interactifs** : Progression, répartition par statut
- **Notifications récentes** : Alertes et mises à jour importantes
- **Projets prioritaires** : Liste des projets nécessitant une attention

#### Gestion des Projets
- **Liste des projets** : Vue tabulaire avec filtres et tri
- **Création de projet** : Formulaire détaillé avec toutes les informations
- **Vue détaillée** : Informations complètes, historique, commentaires
- **Modification** : Interface d'édition avec validation

#### Administration
- **Gestion des utilisateurs** : Création, modification, attribution des rôles
- **Configuration système** : Paramètres globaux, notifications
- **Rapports** : Génération et export de rapports détaillés

## 🛡️ Sécurité

### 🔒 Mesures de Sécurité Implémentées

- **Authentification JWT** : Tokens sécurisés avec expiration automatique
- **Hachage des mots de passe** : Bcrypt avec salt pour sécuriser les mots de passe
- **Validation des données** : Sanitisation et validation côté serveur
- **CORS configuré** : Protection contre les attaques cross-origin
- **Rate limiting** : Protection contre les attaques par déni de service
- **Validation des fichiers** : Vérification des types et tailles de fichiers uploadés

### 🔑 Gestion des Rôles et Permissions

| Rôle | Projets | Utilisateurs | Administration | Commentaires |
|------|---------|--------------|----------------|--------------|
| **Super Admin** | Tous droits | Création/Modification/Suppression | Accès complet | Tous droits |
| **Manager** | Création/Modification/Vue | Vue équipe | Paramètres limités | Modération |
| **Employé** | Vue/Modification assignés | Vue profil | Non | Création/Modification propres |
| **Utilisateur** | Vue assignés | Vue profil | Non | Création |

## 🧪 Tests et Développement

### 🔍 Tests Frontend
```bash
cd client
npm test
```

### 🐛 Débogage
```bash
# Logs détaillés du serveur
DEBUG=* npm run dev

# Vérification de la base de données
mongo srm_project_db
db.projects.find().pretty()
```

### 📊 Monitoring de Performance
- Surveillez les logs du serveur pour les erreurs
- Utilisez les outils de développement du navigateur pour le frontend
- Vérifiez les performances de la base de données MongoDB

## 🔧 Scripts Disponibles

### Scripts Principaux
```bash
npm start              # Démarrer le serveur en production
npm run dev            # Démarrer le serveur en mode développement
npm run client         # Démarrer uniquement le client React
npm run dev:full       # Démarrer serveur + client simultanément
npm run build          # Construire l'application pour la production
npm run update-photos  # Script de mise à jour des photos utilisateurs
```

### Scripts de Maintenance
```bash
# Nettoyage des dépendances
npm run clean

# Mise à jour des dépendances
npm update

# Vérification de sécurité
npm audit
```

## 📚 API Documentation

### 🔗 Endpoints Principaux

#### Authentification
```
POST /api/auth/register    # Inscription d'un nouvel utilisateur
POST /api/auth/login       # Connexion utilisateur
POST /api/auth/logout      # Déconnexion
GET  /api/auth/me          # Informations utilisateur connecté
```

#### Projets
```
GET    /api/projects       # Liste tous les projets
POST   /api/projects       # Créer un nouveau projet
GET    /api/projects/:id   # Détails d'un projet spécifique
PUT    /api/projects/:id   # Modifier un projet
DELETE /api/projects/:id   # Supprimer un projet
```

#### Utilisateurs
```
GET    /api/users          # Liste des utilisateurs (Admin)
POST   /api/users          # Créer un utilisateur (Admin)
PUT    /api/users/:id      # Modifier un utilisateur
DELETE /api/users/:id      # Supprimer un utilisateur (Admin)
```

#### Commentaires
```
GET    /api/comments/:projectId    # Commentaires d'un projet
POST   /api/comments              # Ajouter un commentaire
PUT    /api/comments/:id          # Modifier un commentaire
DELETE /api/comments/:id          # Supprimer un commentaire
```

## 🔄 Déploiement en Production

### 🌐 Préparation pour la Production

1. **Build de l'application** :
```bash
npm run build
```

2. **Variables d'environnement de production** :
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-server/srm_project_db
JWT_SECRET=votre_clé_très_sécurisée_pour_production
PORT=80
```

3. **Déploiement sur serveur** :
- Utilisez PM2 pour la gestion des processus
- Configurez un reverse proxy avec Nginx
- Assurez-vous que MongoDB est sécurisé et sauvegardé

### 🐳 Déploiement avec Docker (Optionnel)

Créez un fichier `docker-compose.yml` :
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    
  backend:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/srm_project_db
      
volumes:
  mongodb_data:
```

## 🐛 Dépannage Courant

### ❌ Problèmes Fréquents et Solutions

#### 1. Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
sudo systemctl status mongod

# Redémarrer MongoDB si nécessaire
sudo systemctl restart mongod
```

#### 2. Port déjà utilisé
```bash
# Trouver et arrêter le processus utilisant le port 5000
lsof -ti:5000 | xargs kill -9

# Ou changer le port dans le fichier .env
PORT=5001
```

#### 3. Erreurs de dépendances
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### 4. Problèmes de CORS
Vérifiez que les URLs dans votre configuration CORS correspondent à votre environnement de développement.

## 🤝 Contribution

### 📝 Guide de Contribution

1. **Forkez le projet**
2. **Créez une branche pour votre fonctionnalité** (`git checkout -b feature/AmazingFeature`)
3. **Committez vos changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Poussez vers la branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

### 📋 Standards de Code

- Utilisez des noms de variables descriptifs en français
- Commentez votre code pour les parties complexes
- Respectez l'indentation (2 espaces)
- Testez vos modifications avant de soumettre

## 📞 Support et Contact

### 🆘 Obtenir de l'Aide

- **Documentation** : Consultez ce README et les commentaires dans le code
- **Issues GitHub** : Créez une issue pour rapporter des bugs ou demander des fonctionnalités
- **Email** : [votre.email@domaine.com](mailto:votre.email@domaine.com)

### 📈 Feuille de Route

#### Version 1.1 (À venir)
- [ ] Notifications par email
- [ ] API mobile
- [ ] Exports Excel avancés
- [ ] Intégration calendrier

#### Version 1.2 (Futur)
- [ ] Module de facturation
- [ ] Gestion des ressources
- [ ] Planification Gantt
- [ ] Application mobile

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Équipe de développement** : Pour leur dédication et expertise
- **Superviseurs de stage** : Pour leurs conseils et leur soutien
- **Communauté Open Source** : Pour les outils et bibliothèques utilisés
- **Utilisateurs testeurs** : Pour leurs retours précieux

---

<div align="center">

**Développé avec ❤️ dans le cadre du projet de stage SRM-MS 2025**

[![Built with](https://img.shields.io/badge/Built%20with-MERN%20Stack-brightgreen.svg)](https://www.mongodb.com/)
[![Made in](https://img.shields.io/badge/Made%20in-MOROCCO-red.svg)](https://www.france.fr/)
lue
</div>