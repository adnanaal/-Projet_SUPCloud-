const { verifyToken } = require('../config/jwt');

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT dans le header Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Token manquant ou invalide',
      });
    }

    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);

    // Vérifier le token
    const decoded = verifyToken(token);

    // Ajouter les informations de l'utilisateur à la requête
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Non authentifié',
      message: 'Token invalide ou expiré',
    });
  }
};

module.exports = authMiddleware;
