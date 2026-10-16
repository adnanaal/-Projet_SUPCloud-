/**
 * Classe d'erreur personnalisée pour les erreurs d'application
 */
class AppError extends Error {
  constructor(statusCode, message, name = 'AppError') {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}

module.exports = AppError;
