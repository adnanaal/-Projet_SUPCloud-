# SUPCloud

Projet SUPCloud - Application web de stockage cloud sécurisée et hautement disponible.

## Dépôt Git

https://github.com/adnanaal/-Projet_SUPCloud-

## Stack Technologique

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
- **UI library**: Tailwind CSS + shadcn/ui
- **HTTP client**: Axios
- **File icons**: lucide-react
- **PDF viewer**: react-pdf
- **Video player**: HTML5 video

### Infrastructure
- **Conteneurisation**: Docker + Docker Compose
- **Volumes**: Persistants pour PostgreSQL et fichiers

## Fonctionnalités Principales

- Gestion des utilisateurs (inscription, connexion, OAuth2)
- Gestion complète des fichiers et dossiers (CRUD)
- Quota de stockage de 30 Go par utilisateur
- Prévisualisation de fichiers (images, vidéos, PDF, texte)
- Téléchargement de dossiers en ZIP
- Corbeille avec restauration
- Interface web moderne et réactive