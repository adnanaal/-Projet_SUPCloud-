const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier de stockage absolu (indépendant du répertoire de travail du processus)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Erreur de validation de fichier (retournée en 400 par errorHandler)
const fileValidationError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  err.name = 'FileValidationError';
  return err;
};

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique : timestamp + nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Types de fichiers acceptés (plus tolérant)
const allowedFileTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

// Types génériques acceptés pour les fichiers sans extension spécifique
const genericMimeTypes = [
  'application/octet-stream',
  'application/x-download',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
];

// Limite de taille maximale (100 Mo)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Filtre pour valider le type et la taille du fichier
const fileFilter = (req, file, cb) => {
  // Vérifier si un fichier est fourni
  if (!file) {
    return cb(fileValidationError('Aucun fichier fourni'), false);
  }

  // Vérifier la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return cb(fileValidationError(`La taille du fichier dépasse la limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo`), false);
  }

  // Vérifier le type MIME
  const isKnownType = allowedFileTypes[file.mimetype];
  const isGenericType = genericMimeTypes.includes(file.mimetype);
  const isTextType = file.mimetype?.startsWith('text/');
  const isAudioType = file.mimetype?.startsWith('audio/');

  if (!isKnownType && !isGenericType && !isTextType && !isAudioType) {
    return cb(fileValidationError('Type de fichier non supporté. Types acceptés : images, vidéos, audio, PDF, texte, documents Office, archives'), false);
  }

  // Pour les types connus, vérifier l'extension
  if (isKnownType) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedFileTypes[file.mimetype];
    
    if (!allowedExtensions.includes(ext)) {
      // Si l'extension ne correspond pas, on accepte quand même pour éviter les blocages
      console.warn(`Extension ${ext} ne correspond pas au type MIME ${file.mimetype} pour ${file.originalname}`);
    }
  }

  cb(null, true);
};

// Configuration Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
