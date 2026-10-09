# Frontend SUPCloud

Frontend React pour l'application de stockage cloud SUPCloud.

## 📋 Description

Ce frontend fournit une interface web moderne et réactive pour gérer les fichiers et dossiers de l'application SUPCloud. Il utilise React 18, Vite, Redux Toolkit pour la gestion d'état, Tailwind CSS pour le style, et Axios pour les appels API.

## 🚀 Technologies

- **Framework** : React 18+
- **Build tool** : Vite
- **Routing** : React Router v6
- **State management** : Redux Toolkit
- **UI library** : Tailwind CSS
- **HTTP client** : Axios
- **Icons** : Lucide React
- **PDF viewer** : React PDF
- **Video player** : HTML5 Video

## 📦 Prérequis

- Node.js 20+
- npm ou yarn

## 🔧 Installation

1. Cloner le repository
```bash
git clone https://github.com/adnanaal/-Projet_SUPCloud-.git
cd SUPCloud/frontend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer l'API
```bash
# L'API backend est configurée dans vite.config.js
# Par défaut, le proxy redirige /api et /auth vers http://localhost:3000
```

## 🎯 Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── assets/       # Images, icônes, fichiers statiques
│   ├── components/   # Composants React
│   │   ├── common/   # Composants réutilisables (Button, Modal, Input, etc.)
│   │   └── layout/   # Composants de layout (Header, Sidebar, Footer, etc.)
│   ├── hooks/        # Custom hooks React
│   ├── pages/        # Pages de l'application
│   ├── services/     # Services API (Axios)
│   ├── store/        # Redux Toolkit store (slices, middleware)
│   ├── types/        # Types TypeScript
│   ├── utils/        # Utilitaires (formatters, helpers)
│   ├── App.jsx       # Composant racine
│   ├── main.jsx      # Point d'entrée
│   └── index.css     # Styles globaux
├── public/           # Fichiers statiques
├── index.html        # Template HTML
├── vite.config.js    # Configuration Vite
├── tailwind.config.js # Configuration Tailwind CSS
├── postcss.config.js # Configuration PostCSS
├── .gitignore        # Fichiers ignorés par Git
├── package.json      # Dépendances et scripts
└── README.md         # Ce fichier
```

## 📄 Pages de l'application

### Dashboard
- Vue d'ensemble du stockage
- Statistiques d'utilisation
- Accès rapide aux fichiers récents

### File Explorer
- Navigation dans l'arborescence des fichiers et dossiers
- Affichage en grille ou en liste
- Breadcrumbs pour la navigation
- Upload de fichiers
- Création de dossiers
- Renommage, déplacement, suppression

### Corbeille
- Liste des éléments supprimés
- Restauration des éléments
- Suppression définitive

### Paramètres
- Modification du profil utilisateur
- Changement de mot de passe
- Gestion des connexions OAuth2
- Affichage du quota de stockage

### Authentification
- Page de connexion
- Page d'inscription
- Connexion avec Google OAuth2
- Connexion avec GitHub OAuth2

## 🎨 Composants principaux

### Layout Components
- `Header` : Barre de navigation supérieure
- `Sidebar` : Menu de navigation latéral
- `Footer` : Pied de page

### Common Components
- `Button` : Bouton réutilisable avec variantes
- `Modal` : Fenêtre modale
- `Input` : Champ de saisie
- `FileCard` : Carte d'affichage de fichier
- `FolderCard` : Carte d'affichage de dossier
- `ProgressBar` : Barre de progression
- `DropZone` : Zone de glisser-déposer

## 🔌 Services API

Les services API sont organisés dans le dossier `src/services/` :

- `authService.js` : Authentification (login, register, logout)
- `userService.js` : Gestion des utilisateurs
- `fileService.js` : Gestion des fichiers
- `folderService.js` : Gestion des dossiers
- `trashService.js` : Gestion de la corbeille

## 🗃️ Redux Store

Le store Redux est organisé en slices :

- `authSlice` : État d'authentification
- `userSlice` : Données utilisateur
- `fileSlice` : État des fichiers
- `folderSlice` : État des dossiers
- `uiSlice` : État de l'interface (modals, notifications)

## 🎨 Style

Le projet utilise Tailwind CSS pour le style. Les classes utilitaires sont organisées selon les conventions de Tailwind.

Thème :
- Couleurs : Palette Tailwind par défaut
- Responsive : Mobile-first
- Dark mode : À implémenter

## 🔍 Prévisualisation des fichiers

L'application supporte la prévisualisation en ligne de :

- **Images** : JPEG, PNG, GIF
- **Vidéos** : MP4, WEBM
- **PDF** : Via react-pdf
- **Texte** : TXT, Markdown

## 📝 Notes

- Le serveur de développement tourne sur le port 5173 par défaut
- Le proxy Vite redirige les requêtes API vers le backend (port 3000)
- Les icônes sont fournies par Lucide React
- Les formulaires utilisent la validation avec Zod

