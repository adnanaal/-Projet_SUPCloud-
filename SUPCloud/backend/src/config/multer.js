const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier de stockage absolu (indépendant du répertoire de travail du processus)
// Dossier de stockage : UPLOAD_DIR (ex. volume Docker), sinon backend/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Quota par défaut d'un utilisateur : 30 Go
const DEFAULT_USER_QUOTA = 30 * 1000 * 1000 * 1000;

// Taille maximale d'un fichier : par défaut le quota complet de l'utilisateur
// (configurable avec MAX_FILE_SIZE_BYTES). Le quota restant est contrôlé séparément.
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_BYTES) || DEFAULT_USER_QUOTA;

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Nom unique sur le disque : timestamp + aléa + extension nettoyée.
    // Le nom d'origine n'est conservé qu'en base de données.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : '';
    cb(null, uniqueSuffix + safeExtension);
  },
});

// Configuration Multer : tous les types de fichiers sont acceptés
// (un service de stockage ne doit pas imposer de liste de formats)
const upload = multer({
  storage: storage,
  // Les navigateurs envoient le nom du fichier en UTF-8 : sans cette option, « très » deviendrait « trÃ¨s »
  defParamCharset: 'utf8',
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
