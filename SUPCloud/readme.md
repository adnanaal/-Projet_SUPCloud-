# SUPCloud

Application web de stockage cloud sécurisée et hautement disponible.

## 📋 Description

SUPCloud est une application de type "cloud storage" similaire à Dropbox ou Google Drive. Chaque utilisateur dispose d'un compte personnel avec un quota de stockage de 30 Go. L'application permet une gestion complète des fichiers et dossiers via une interface web moderne et réactive.

## 🌐 Dépôt Git

https://github.com/adnanaal/-Projet_SUPCloud-

## 🚀 Stack Technologique

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT + Passport.js
- **OAuth2**: Passport avec Google/GitHub strategy
- **Upload**: Multer
- **Compression**: Archiver (ZIP)
- **Validation**: Zod

### Frontend
- **Framework**: React 18+
- **Build tool**: Vite
- **Routing**: React Router v6
- **State management**: Redux Toolkit
- **UI library**: Tailwind CSS
- **HTTP client**: Axios
- **File icons**: lucide-react
- **PDF viewer**: react-pdf
- **Video player**: HTML5 video

### Infrastructure
- **Conteneurisation**: Docker + Docker Compose
- **Volumes**: Persistants pour PostgreSQL et fichiers

## ✨ Fonctionnalités Principales

### Gestion des utilisateurs
- Inscription et connexion
- Authentification locale (email/mot de passe)
- Authentification OAuth2 (Google, GitHub)
- Page de paramètres utilisateur
- Modification du mot de passe
- Gestion des connexions OAuth2
- Affichage du quota de stockage (30 Go par utilisateur)

### Gestion des fichiers et dossiers
- Création de dossiers
- Upload de fichiers (avec barre de progression)
- Upload multiple de fichiers
- Téléchargement de fichiers
- Renommage de fichiers et dossiers
- Déplacement de fichiers et dossiers (drag-and-drop)
- Suppression de fichiers et dossiers
- Téléchargement de dossiers en ZIP (compression serveur à la volée)

### Prévisualisation de fichiers
- Images (JPEG, PNG, GIF)
- Vidéos (MP4, WEBM)
- Fichiers texte (TXT, Markdown)
- PDF

### Corbeille
- Suppression vers la corbeille
- Liste des éléments supprimés
- Restauration depuis la corbeille
- Suppression définitive

### Interface
- Interface web moderne et réactive
- Navigation intuitive
- Design responsive
- Thème cohérent

## 📁 Structure du projet

```
SUPCloud/
├── backend/           # API REST backend
│   ├── src/
│   │   ├── config/       # Configuration (JWT, Passport, etc.)
│   │   ├── controllers/  # Contrôleurs Express
│   │   ├── middleware/    # Middleware (auth, validation, etc.)
│   │   ├── models/       # Modèles Prisma
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Logique métier
│   │   ├── utils/        # Utilitaires
│   │   ├── validators/   # Schémas de validation (Zod)
│   │   └── index.js      # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma # Schéma de la base de données
│   │   └── migrations/   # Migrations
│   ├── uploads/          # Fichiers uploadés
│   ├── tests/            # Tests
│   └── README.md         # Documentation backend
├── frontend/          # Application React
│   ├── src/
│   │   ├── assets/       # Images, icônes
│   │   ├── components/   # Composants React
│   │   │   ├── common/   # Composants réutilisables
│   │   │   └── layout/   # Composants de layout
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   ├── store/        # Redux store
│   │   ├── types/        # Types TypeScript
│   │   ├── utils/        # Utilitaires
│   │   ├── App.jsx       # Composant racine
│   │   └── main.jsx      # Point d'entrée
│   └── README.md         # Documentation frontend
├── docs/              # Documentation
│   ├── tech/            # Documentation technique
│   ├── user/            # Manuel utilisateur
│   └── PLAN_DEVELOPPEMENT.md # Plan de développement
├── sujet.txt          # Sujet du projet
└── readme.md          # Ce fichier
```

## 🔧 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 18+
- Docker (pour la conteneurisation)

### Installation locale

1. Cloner le repository
```bash
git clone https://github.com/adnanaal/-Projet_SUPCloud-.git
cd SUPCloud
```

2. Installer le backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos configurations
npm run prisma:migrate
npm run prisma:generate
```

3. Installer le frontend
```bash
cd ../frontend
npm install
```

4. Démarrer les serveurs
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000

### Installation avec Docker

```bash
docker-compose up
```

## 📊 Architecture

L'application suit une architecture 3-tiers :

1. **Frontend** : Client React qui consomme l'API REST
2. **Backend** : API REST Express.js qui implémente la logique métier
3. **Base de données** : PostgreSQL pour stocker les métadonnées

Les fichiers eux-mêmes sont stockés sur le système de fichiers (volume Docker en production).

## 🔐 Sécurité

- Hachage des mots de passe avec bcrypt
- Authentification JWT
- Middleware d'authentification sur les routes protégées
- Validation des données avec Zod
- OAuth2 pour l'authentification tierce
- Pas de secrets en clair dans le code

## 📝 Documentation

- [Plan de développement](docs/PLAN_DEVELOPPEMENT.md)
- [Documentation backend](backend/README.md)
- [Documentation frontend](frontend/README.md)
- [Documentation technique](docs/tech/) (à venir)
- [Manuel utilisateur](docs/user/) (à venir)

## 🤝 Contribution

Ce projet est réalisé dans le cadre d'un projet universitaire. Pour toute question ou suggestion, veuillez ouvrir une issue sur le dépôt Git.

## 📄 Licence

Ce projet est soumis aux termes de la licence du projet universitaire.

## 👨‍💻 Auteurs

- [Adnane Aal](https://github.com/adnanaal)
