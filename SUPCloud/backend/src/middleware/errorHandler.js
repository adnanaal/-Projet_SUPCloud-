/**
 * Middleware de gestion d'erreurs global
 * Capture toutes les erreurs et les retourne dans un format uniforme
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreurs Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'La taille du fichier dépasse la limite autorisée',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      error: 'Trop de fichiers',
      message: 'Le nombre de fichiers dépasse la limite autorisée',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Fichier inattendu',
      message: 'Le champ de fichier est manquant',
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'Erreur lors de l\'upload',
      message: err.message,
    });
  }

  // Erreurs Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflit de données',
      message: 'Une entrée avec ces données existe déjà',
      details: err.meta,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Données non trouvées',
      message: 'L\'enregistrement demandé n\'existe pas',
    });
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message,
      details: err.errors,
    });
  }

  // Erreurs d'authentification
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Non autorisé',
      message: err.message,
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Le token d\'authentification a expiré',
    });
  }

  // Erreurs génériques
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    error: err.name || 'Erreur',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
