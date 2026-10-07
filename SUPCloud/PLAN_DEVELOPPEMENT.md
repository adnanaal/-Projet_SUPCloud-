# Plan de Développement SUPCloud - 2 Mois (8 Semaines)

Basé sur l'analyse du sujet et du README, voici un plan structuré en 8 semaines avec priorité sur les parties éliminatoires (Documentation, Architecture, Fonctionnalités).

---

## Semaine 1 : Setup & Architecture de Base

**Objectifs** : Initialisation du projet, configuration de l'environnement, architecture de base

- **Jour 1-2** :
  - Initialisation Git (commits réguliers dès le début)
  - Création structure de dossiers (backend, frontend, docs)
  - Setup backend Node.js + Express
  - Setup frontend React + Vite

- **Jour 3-4** :
  - Configuration Prisma + PostgreSQL
  - Schéma de base de données (Users, Files, Folders, Trash)
  - Configuration JWT + Passport.js
  - Setup variables d'environnement (.env.example)

- **Jour 5-7** :
  - Configuration locale PostgreSQL
  - Test de connexion à la base de données
  - Migration Prisma initiale
  - **Milestone** : Infrastructure locale prête

---

## Semaine 2 : Authentification & Gestion Utilisateurs

**Objectifs** : Inscription, connexion, OAuth2, quota de stockage

- **Jour 1-2** :
  - API Authentification (inscription, login, logout)
  - Hachage sécurisé des mots de passe (bcrypt)
  - Middleware JWT pour routes protégées

- **Jour 3-4** :
  - OAuth2 avec Google et GitHub (Passport.js)
  - Page de connexion frontend avec options OAuth2
  - Gestion des tokens OAuth2

- **Jour 5-7** :
  - Page Paramètres utilisateur
  - Modification mot de passe
  - Gestion des connexions OAuth2
  - Affichage quota utilisé/restant (30 Go)
  - **Milestone** : Authentification complète (20/20 pts)

---

## Semaine 3 : API Backend - Gestion Fichiers & Dossiers

**Objectifs** : API REST complète pour la gestion des fichiers

- **Jour 1-2** :
  - Modèles Prisma pour Files et Folders
  - API CRUD dossiers (create, read, update, delete)
  - Structure arborescente avec parent_id

- **Jour 3-4** :
  - API upload fichiers (Multer avec barre de progression)
  - Validation types et tailles de fichiers
  - Gestion du quota utilisateur (vérification avant upload)

- **Jour 5-7** :
  - API rename fichiers/dossiers
  - API move fichiers/dossiers (déplacement)
  - API delete fichiers/dossiers (corbeille)
  - **Milestone** : API backend fichiers/dossiers fonctionnelle

---

## Semaine 4 : Frontend - Interface Principale & Navigation

**Objectifs** : Interface web moderne, navigation, affichage fichiers

- **Jour 1-2** :
  - Setup Redux Toolkit (state management)
  - Structure des pages (Dashboard, Fichiers, Paramètres)
  - Navigation avec React Router v6

- **Jour 3-4** :
  - Composant affichage arborescence fichiers/dossiers
  - Grille/Liste de fichiers avec icônes (lucide-react)
  - Breadcrumbs pour navigation

- **Jour 5-7** :
  - Intégration Tailwind CSS + shadcn/ui
  - Thème cohérent et responsive
  - Drag-and-drop pour déplacement (bonus)
  - **Milestone** : Interface principale fonctionnelle

---

## Semaine 5 : Opérations Fichiers & Corbeille

**Objectifs** : Upload, téléchargement, suppression, corbeille

- **Jour 1-2** :
  - Formulaire upload avec barre de progression
  - Upload multiple de fichiers
  - Création de dossiers

- **Jour 3-4** :
  - Téléchargement fichiers individuels
  - Téléchargement dossiers en ZIP (compression serveur à la volée)
  - Renommage fichiers/dossiers

- **Jour 5-7** :
  - Suppression vers corbeille
  - Page Corbeille avec liste des éléments supprimés
  - Restauration depuis corbeille
  - Suppression définitive
  - **Milestone** : Opérations fichiers complètes (50+30 pts)

---

## Semaine 6 : Prévisualisation de Fichiers

**Objectifs** : Visionneuse pour images, vidéos, PDF, texte

- **Jour 1-2** :
  - Modal visionneuse fichiers
  - Prévisualisation images (JPEG, PNG, GIF)
  - Prévisualisation vidéos (MP4, WEBM)

- **Jour 3-4** :
  - Prévisualisation PDF (react-pdf)
  - Prévisualisation fichiers texte (TXT, Markdown)

- **Jour 5-7** :
  - Gestion des erreurs de prévisualisation
  - Fallback pour formats non supportés
  - Optimisation des performances
  - **Milestone** : Prévisualisation complète (30 pts)

---

## Semaine 7 : Tests, Sécurité & Optimisation

**Objectifs** : Tests, sécurité, validation des parties éliminatoires

- **Jour 1-2** :
  - Vérification sécurité (pas de secrets en clair)
  - Validation injection SQL, XSS
  - Tests API (unitaires ou manuels)

- **Jour 3-4** :
  - Tests frontend (comportements utilisateurs)
  - Tests OAuth2
  - Tests de charge

- **Jour 5-7** :
  - Optimisation UI/UX (fluidité, chargement)
  - Gestion des erreurs utilisateurs
  - Validation architecture 3-tiers
  - **Milestone** : Sécurité et architecture validées

---

## Semaine 8 : Documentation & Finalisation

**Objectifs** : Documentation technique, manuel utilisateur, préparation rendu

- **Jour 1-2** :
  - Documentation technique :
    - Justifications choix technologiques
    - Guide de déploiement
    - Schéma base de données
    - Architecture API (endpoints principaux)

- **Jour 3-4** :
  - Manuel utilisateur :
    - Guide d'utilisation de l'application
    - Explication des fonctionnalités
    - Captures d'écran

- **Jour 5-7** :
  - Review complète du code
  - Nettoyage Git (commits propres)
  - Préparation archive ZIP
  - **Milestone** : Documentation complète (50 pts - éliminatoire si < 30)

---

## Semaine 9 : Conteneurisation Docker

**Objectifs** : Dockerisation complète du projet

- **Jour 1-2** :
  - Création Dockerfile pour le backend
  - Création Dockerfile pour le frontend
  - Configuration docker-compose.yml (backend, frontend, PostgreSQL, volumes)

- **Jour 3-4** :
  - Test de conteneurisation locale
  - Vérification persistance des données
  - Test des volumes Docker

- **Jour 5-7** :
  - Optimisation des images Docker
  - Documentation de déploiement Docker
  - Test final docker-compose up
  - **Milestone** : Conteneurisation fonctionnelle (éliminatoire si < 40/50)

---

## Répartition des Points par Semaine

| Semaine | Objectifs | Points Cibles |
|---------|-----------|---------------|
| 1 | Setup & Architecture locale | Infrastructure prête |
| 2 | Authentification | 20/20 pts (Auth) |
| 3 | API Backend | Base fonctionnelle |
| 4 | Frontend UI | UI/UX en cours |
| 5 | Opérations Fichiers | 80/80 pts (CRUD + Corbeille) |
| 6 | Prévisualisation | 30/30 pts |
| 7 | Tests & Sécurité | Architecture validée |
| 8 | Documentation | 50/50 pts (éliminatoire) |
| 9 | Conteneurisation Docker | 50/50 pts (éliminatoire) |

**Total cible** : 300/300 points (avec bonus possibles)

---

## Priorités Éliminatoires

1. **Documentation (≥ 30/50)** - Semaine 8
2. **Architecture/Docker (≥ 40/50)** - Semaine 9
3. **Fonctionnalités (≥ 120/170)** - Semaines 2-6

---

## Risques & Mitigations

- **OAuth2 complexité** : Prioriser Google + GitHub, tests précoces
- **Compression ZIP serveur** : Bibliothèque Archiver, tests charge
- **Persistance Docker** : Volumes configurés en Semaine 9
- **Git commits insuffisants** : Commits quotidiens, messages clairs
- **Secrets en clair** : .env.example + validation Semaine 7
- **PostgreSQL local** : Installation et configuration locale en Semaine 1

---

## Stack Technologique

### Backend
- Runtime: Node.js 20+
- Framework: Express.js
- Base de données: PostgreSQL
- ORM: Prisma
- Authentification: JWT + Passport.js
- OAuth2: Passport avec Google/GitHub strategy
- Upload: Multer
- Compression: Archiver (ZIP)
- Validation: Zod

### Frontend
- Framework: React 18+
- Build tool: Vite
- Routing: React Router v6
- State management: Redux Toolkit
- UI library: Tailwind CSS + shadcn/ui
- HTTP client: Axios
- File icons: lucide-react
- PDF viewer: react-pdf
- Video player: HTML5 video

### Infrastructure
- Conteneurisation: Docker + Docker Compose
- Volumes: Persistants pour PostgreSQL et fichiers

---

## Fonctionnalités Principales

- Gestion des utilisateurs (inscription, connexion, OAuth2)
- Gestion complète des fichiers et dossiers (CRUD)
- Quota de stockage de 30 Go par utilisateur
- Prévisualisation de fichiers (images, vidéos, PDF, texte)
- Téléchargement de dossiers en ZIP
- Corbeille avec restauration
- Interface web moderne et réactive
