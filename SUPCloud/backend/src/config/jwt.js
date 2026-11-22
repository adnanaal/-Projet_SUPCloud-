const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Générer un token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @returns {String} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Vérifier un token JWT
 * @param {String} token - Token à vérifier
 * @returns {Object} Données décodées du token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const LINK_TOKEN_EXPIRES_IN = '10m';

/**
 * Générer un jeton de rattachement d'un compte OAuth2 : il autorise uniquement le rattachement
 * du fournisseur indiqué à l'utilisateur indiqué, pendant 10 minutes. Il ne donne aucun accès à l'API.
 */
const generateLinkToken = (userId, provider) => {
  return jwt.sign({ purpose: 'oauth-link', userId, provider }, JWT_SECRET, {
    expiresIn: LINK_TOKEN_EXPIRES_IN,
  });
};

/**
 * Vérifier un jeton de rattachement pour un fournisseur donné
 * @returns {Object} { userId, provider }
 */
const verifyLinkToken = (token, provider) => {
  const payload = jwt.verify(token, JWT_SECRET);

  if (payload.purpose !== 'oauth-link' || payload.provider !== provider || !payload.userId) {
    throw new Error('Jeton de rattachement invalide');
  }

  return payload;
};

module.exports = {
  generateToken,
  verifyToken,
  generateLinkToken,
  verifyLinkToken,
};
