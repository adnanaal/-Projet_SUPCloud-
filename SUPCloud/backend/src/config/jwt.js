const jwt = require('jsonwebtoken');

// Secret de signature des jetons : obligatoire, sans valeur par défaut. Sans lui, n'importe qui
// connaissant la valeur de repli pourrait fabriquer un jeton valide pour n'importe quel compte.
const MIN_JWT_SECRET_LENGTH = 32;
const PLACEHOLDER_SECRETS = ['your_jwt_secret_here', 'your-secret-key', 'changeme', 'secret'];
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < MIN_JWT_SECRET_LENGTH || PLACEHOLDER_SECRETS.includes(JWT_SECRET)) {
  throw new Error(
    `JWT_SECRET manquant ou trop faible : définissez dans backend/.env une valeur aléatoire d'au moins ${MIN_JWT_SECRET_LENGTH} caractères ` +
      "(par exemple : node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
  );
}

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
