const multer = require('multer');
const path = require('path');

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique : timestamp + nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Types de fichiers acceptés avec leurs extensions correspondantes
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

// Limite de taille maximale (100 Mo)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Filtre pour valider le type et la taille du fichier
const fileFilter = (req, file, cb) => {
  // Vérifier si un fichier est fourni
  if (!file) {
    return cb(new Error('Aucun fichier fourni'), false);
  }

  // Vérifier la taille du fichier
  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error(`La taille du fichier dépasse la limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo`), false);
  }

  // Vérifier le type MIME
  if (!allowedFileTypes[file.mimetype]) {
    return cb(new Error('Type de fichier non supporté. Types acceptés : images (JPEG, PNG, GIF, WEBP), vidéos (MP4, WEBM), PDF, texte, documents Office'), false);
  }

  // Vérifier l'extension du fichier correspond au type MIME
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = allowedFileTypes[file.mimetype];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`L'extension du fichier ne correspond pas au type MIME. Extension attendue : ${allowedExtensions.join(', ')}`), false);
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
