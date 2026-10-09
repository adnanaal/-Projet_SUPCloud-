# Backend SUPCloud

Backend API REST pour l'application de stockage cloud SUPCloud.

## 📋 Description

Ce backend fournit une API REST complète pour gérer les utilisateurs, les fichiers et les dossiers de l'application SUPCloud. Il utilise Express.js, Prisma ORM, PostgreSQL, JWT pour l'authentification et Passport.js pour OAuth2.

## 🚀 Technologies

- **Runtime** : Node.js 20+
- **Framework** : Express.js
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT + Passport.js
- **OAuth2** : Google, GitHub
- **Upload** : Multer
- **Compression** : Archiver (ZIP)
- **Validation** : Zod

## 📦 Prérequis

- Node.js 20+
- PostgreSQL 18+
- npm ou yarn

## 🔧 Installation

1. Cloner le repository
```bash
git clone https://github.com/adnanaal/-Projet_SUPCloud-.git
cd SUPCloud/backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :
```env
PORT=3000
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/supcloud?schema=public"
JWT_SECRET=votre_jwt_secret
JWT_EXPIRES_IN=7d

# OAuth2 Google
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth2 GitHub
GITHUB_CLIENT_ID=votre_github_client_id
GITHUB_CLIENT_SECRET=votre_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

4. Configurer la base de données
```bash
# Exécuter les migrations Prisma
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate
```

## 🎯 Scripts disponibles

```bash
# Démarrer le serveur en mode développement
npm run dev

# Démarrer le serveur en mode production
npm start

# Exécuter les migrations Prisma
npm run prisma:migrate

# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio
npm run prisma:studio
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/       # Configuration (JWT, Passport, etc.)
│   ├── controllers/  # Contrôleurs Express
│   ├── middleware/    # Middleware (auth, validation, etc.)
│   ├── models/       # Modèles Prisma
│   ├── routes/       # Routes API
│   ├── services/     # Logique métier
│   ├── utils/        # Utilitaires
│   ├── validators/   # Schémas de validation (Zod)
│   └── index.js      # Point d'entrée de l'application
├── prisma/
│   ├── schema.prisma # Schéma de la base de données
│   └── migrations/   # Migrations de la base de données
├── uploads/          # Fichiers uploadés par les utilisateurs
├── tests/            # Tests
├── .env              # Variables d'environnement (non versionné)
├── .env.example      # Template des variables d'environnement
├── .gitignore        # Fichiers ignorés par Git
├── package.json      # Dépendances et scripts
└── README.md         # Ce fichier
```

## 🔌 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `POST /api/auth/logout` - Déconnexion
- `GET /auth/google` - Connexion avec Google OAuth2
- `GET /auth/google/callback` - Callback Google OAuth2
- `GET /auth/github` - Connexion avec GitHub OAuth2
- `GET /auth/github/callback` - Callback GitHub OAuth2

### Utilisateurs

- `GET /api/users/me` - Récupérer les informations de l'utilisateur connecté
- `PUT /api/users/me` - Mettre à jour le profil utilisateur
- `PUT /api/users/me/password` - Changer le mot de passe

### Fichiers

- `POST /api/files/upload` - Uploader un fichier
- `GET /api/files/:id` - Récupérer un fichier
- `PUT /api/files/:id` - Renommer un fichier
- `DELETE /api/files/:id` - Supprimer un fichier
- `GET /api/files/:id/download` - Télécharger un fichier
- `PUT /api/files/:id/move` - Déplacer un fichier

### Dossiers

- `POST /api/folders` - Créer un dossier
- `GET /api/folders/:id` - Récupérer un dossier
- `PUT /api/folders/:id` - Renommer un dossier
- `DELETE /api/folders/:id` - Supprimer un dossier
- `PUT /api/folders/:id/move` - Déplacer un dossier
- `GET /api/folders/:id/download` - Télécharger un dossier en ZIP

### Corbeille

- `GET /api/trash` - Lister les éléments de la corbeille
- `POST /api/trash/:id/restore` - Restaurer un élément
- `DELETE /api/trash/:id` - Supprimer définitivement un élément

## 🗄️ Schéma de la base de données

### User
- `id` : UUID (clé primaire)
- `email` : String (unique)
- `password` : String (hashé)
- `name` : String
- `avatar` : String
- `googleId` : String (unique, OAuth2)
- `githubId` : String (unique, OAuth2)
- `storageUsed` : BigInt (espace utilisé en octets)
- `storageLimit` : BigInt (quota, 30 Go par défaut)
- `createdAt` : DateTime
- `updatedAt` : DateTime

### Folder
- `id` : UUID (clé primaire)
- `name` : String
- `parentId` : UUID (référence au dossier parent)
- `userId` : UUID (référence à l'utilisateur)
- `createdAt` : DateTime
- `updatedAt` : DateTime

### File
- `id` : UUID (clé primaire)
- `name` : String
- `size` : BigInt (taille en octets)
- `mimeType` : String
- `path` : String (chemin du fichier)
- `folderId` : UUID (référence au dossier parent)
- `userId` : UUID (référence à l'utilisateur)
- `createdAt` : DateTime
- `updatedAt` : DateTime

### TrashItem
- `id` : UUID (clé primaire)
- `name` : String
- `type` : String ('file' ou 'folder')
- `originalId` : String (ID original du fichier/dossier)
- `userId` : UUID (référence à l'utilisateur)
- `expiresAt` : DateTime (date d'expiration)
- `createdAt` : DateTime

## 🔐 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Utilisation de JWT pour l'authentification
- Middleware d'authentification sur les routes protégées
- Validation des données avec Zod
- OAuth2 pour l'authentification tierce (Google, GitHub)

## 📝 Notes

- Le fichier `.env` ne doit pas être commité (déjà dans .gitignore)
- Les fichiers uploadés sont stockés dans le dossier `uploads/`
- Le quota de stockage par défaut est de 30 Go (32212254720 octets)

