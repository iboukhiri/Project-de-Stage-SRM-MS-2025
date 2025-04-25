# Projet de Stage SRM-MS 2025

Une application moderne de gestion de projets construite avec React et Node.js, avec une interface utilisateur élégante basée sur Material-UI et des fonctionnalités avancées de visualisation de données.

## Fonctionnalités principales

- 🔐 Authentification utilisateur (Connexion/Inscription)
- 🌓 Basculement entre thème clair/sombre
- 📊 Tableau de bord interactif avec statistiques en temps réel
- 📱 Conception responsive adaptée à tous les appareils
- 📈 Visualisations et graphiques améliorés
  - Taux de complétion des projets
  - Tendances d'achèvement
  - Analyse de progression
- 📋 Gestion complète des projets
  - Création et édition de projets
  - Attribution d'utilisateurs
  - Suivi de progression détaillé
  - Système de commentaires
- 👥 Gestion des utilisateurs avec rôles différenciés
- 🛠️ Interface d'administration spécialisée

## Améliorations récentes

- ✅ Refonte complète des graphiques de tendance
- ✅ Améliorations visuelles pour les indicateurs de performance
- ✅ Interface administrateur avec notifications spécifiques
- ✅ Optimisation de la performance et de l'expérience utilisateur
- ✅ Ajout de fonctionnalités de filtrage et tri avancés

## Stack technique

- **Frontend:**
  - React
  - Material-UI 
  - React Router
  - Axios
  - Chart.js pour les visualisations
  - Context API pour la gestion d'état

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - JWT pour l'authentification

## Configuration de GitHub

1. Créer un nouveau repository sur GitHub:
   - Accédez à [GitHub](https://github.com) et connectez-vous
   - Cliquez sur "New repository"
   - Nommez votre repository (ex: "Project-de-Stage-SRM-MS-2025")
   - Choisissez une visibilité (publique ou privée)
   - Ne pas initialiser avec README, .gitignore ou licence car le projet en contient déjà
   - Cliquez sur "Create repository"

2. Initialiser le repository local et pousser vers GitHub:
```bash
# Si le dossier n'est pas déjà initialisé comme repository Git
git init

# Ajouter tous les fichiers pour commit
git add .

# Créer le premier commit
git commit -m "Initial commit"

# Ajouter le remote URL (remplacez USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/Project-de-Stage-SRM-MS-2025.git

# Pousser vers GitHub
git push -u origin master
```

## Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/VOTRE-USERNAME/Project-de-Stage-SRM-MS-2025.git
cd Project-de-Stage-SRM-MS-2025
```

2. Installer les dépendances du backend et du frontend:
```bash
# Installer les dépendances du backend
npm install

# Installer les dépendances du frontend
cd client
npm install
```

3. Créer un fichier `.env` dans le répertoire racine avec les variables suivantes:
```env
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
PORT=5001
```

4. Démarrer les serveurs de développement:
```bash
# Démarrer le backend et le frontend simultanément (depuis le répertoire racine)
npm run dev:full

# Ou démarrer séparément:
# Backend (depuis le répertoire racine)
npm run dev

# Frontend (depuis le répertoire client)
cd client
npm start
```

## Prérequis système

- Node.js version: 14.x ou supérieure
- MongoDB: 4.x ou supérieure
- npm: 6.x ou supérieure

## Contributions

Ce projet a été développé dans le cadre d'un stage professionnel. Les contributions sont les bienvenues via pull requests.

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails. 