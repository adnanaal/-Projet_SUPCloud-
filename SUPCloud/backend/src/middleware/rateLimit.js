const { rateLimit } = require('express-rate-limit');

/**
 * Limiteur de requêtes par adresse IP. Seuls les échecs sont comptés quand onlyFailures est vrai :
 * un utilisateur qui se connecte normalement n'est jamais bloqué.
 */
const createLimiter = ({ windowMinutes, max, onlyFailures = false, message }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    skipSuccessfulRequests: onlyFailures,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      const minutes = Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 60000));
      res.status(429).json({
        error: 'Trop de tentatives',
        message: `${message} Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      });
    },
  });

const envNumber = (name, fallback) => Number(process.env[name]) || fallback;

// Connexion : 10 échecs par quinzaine de minutes (protection contre le test de mots de passe en série)
const loginLimiter = createLimiter({
  windowMinutes: 15,
  max: envNumber('LOGIN_RATE_LIMIT_MAX', 10),
  onlyFailures: true,
  message: 'Trop de tentatives de connexion échouées.',
});

// Inscription : 20 comptes par heure et par adresse IP
const registerLimiter = createLimiter({
  windowMinutes: 60,
  max: envNumber('REGISTER_RATE_LIMIT_MAX', 20),
  message: "Trop de comptes créés depuis cette adresse.",
});

// Actions qui vérifient le mot de passe actuel (changement de mot de passe, suppression du compte)
const passwordCheckLimiter = createLimiter({
  windowMinutes: 15,
  max: envNumber('PASSWORD_CHECK_RATE_LIMIT_MAX', 10),
  onlyFailures: true,
  message: 'Trop de tentatives avec un mot de passe incorrect.',
});

module.exports = { loginLimiter, registerLimiter, passwordCheckLimiter };
