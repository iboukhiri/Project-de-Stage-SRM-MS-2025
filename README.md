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

## Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/votre-utilisateur/Project-de-Stage-SRM-MS-2025.git
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
# Démarrer le backend (depuis le répertoire racine)
npm run server

# Démarrer le frontend (depuis le répertoire client)
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