require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const trashRoutes = require('./routes/trashRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const toPublicUser = require('./utils/publicUser');
const { verifyLinkToken } = require('./config/jwt');

const app = express();

// En cas d'échec ou d'annulation de la connexion OAuth2, retour sur la page de connexion du frontend
const OAUTH_FAILURE_REDIRECT = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth`;
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser Passport
app.use(passport.initialize());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SUPCloud API - Bienvenue' });
});

// Route de fallback pour OAuth2 failureRedirect
app.get('/login', (req, res) => {
  res.status(401).json({
    error: 'Authentification échouée',
    message: 'La connexion via OAuth2 a échoué',
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes utilisateur
app.use('/api/users', userRoutes);

// Routes dossiers
app.use('/api/folders', folderRoutes);

// Routes fichiers
app.use('/api/files', fileRoutes);

// Routes corbeille
app.use('/api/trash', trashRoutes);

// Routes OAuth2

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OAUTH_PROVIDERS = {
  google: { scope: ['profile', 'email'] },
  github: { scope: ['user:email'] },
  microsoft: { scope: ['openid', 'profile', 'email', 'User.Read'] },
};

// Microsoft est optionnel : sans identifiants configurés, on revient sur la page de connexion
const microsoftEnabled = Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
const requireProvider = (provider) => (req, res, next) =>
  provider === 'microsoft' && !microsoftEnabled ? res.redirect(OAUTH_FAILURE_REDIRECT) : next();

// Retour dans les Paramètres après une tentative de rattachement (succès ou erreur)
const settingsRedirect = (params) => `${FRONTEND_URL}/settings?${new URLSearchParams(params).toString()}`;

// Le paramètre « state » renvoyé par le fournisseur contient le jeton de rattachement : rattachement, pas connexion
const isLinkRequest = (req, provider) => {
  try {
    return Boolean(req.query.state) && Boolean(verifyLinkToken(String(req.query.state), provider));
  } catch (error) {
    return false;
  }
};

// Démarrage : /auth/<fournisseur> (connexion) ou /auth/<fournisseur>?link=<jeton> (rattachement
// d'un compte au profil déjà connecté ; le jeton est transmis au fournisseur dans « state »)
const startOAuth = (provider) => (req, res, next) => {
  const options = { scope: OAUTH_PROVIDERS[provider].scope };

  if (req.query.link) {
    try {
      verifyLinkToken(String(req.query.link), provider);
    } catch (error) {
      return res.redirect(settingsRedirect({ oauth: 'error', reason: 'expired' }));
    }
    options.state = String(req.query.link);
  }

  return passport.authenticate(provider, options)(req, res, next);
};

// Callback OAuth2 : une erreur de la stratégie (email absent, échec de l'échange de code...) ou un refus
// ramène sur l'application au lieu d'afficher une réponse JSON brute :
// page de connexion pour une connexion, Paramètres pour un rattachement
const oauthCallback = (provider) => (req, res, next) =>
  passport.authenticate(provider, { session: false }, (error, result) => {
    const linking = isLinkRequest(req, provider);

    if (error || !result) {
      console.error(`Échec de la connexion OAuth2 (${provider}) :`, error ? error.message : 'authentification refusée');
      if (!linking && !(error && error.code === 'LINK_EXPIRED')) {
        return res.redirect(OAUTH_FAILURE_REDIRECT);
      }
      return res.redirect(settingsRedirect({ oauth: 'error', reason: error && error.code === 'LINK_EXPIRED' ? 'expired' : 'failed' }));
    }

    // Erreur métier : compte déjà rattaché ailleurs, fournisseur déjà connecté...
    if (result.error) {
      console.error(`Rattachement OAuth2 refusé (${provider}) : ${result.error}`);
      return linking
        ? res.redirect(settingsRedirect({ oauth: 'error', reason: result.error }))
        : res.redirect(OAUTH_FAILURE_REDIRECT);
    }

    req.oauthResult = result;
    return next();
  })(req, res, next);

// Fin du parcours : retour sur l'accueil connecté, ou dans les Paramètres après un rattachement
const finishOAuth = (provider) => (req, res) => {
  const { user, token, linked } = req.oauthResult;

  if (linked) {
    return res.redirect(settingsRedirect({ linked: provider }));
  }

  const userWithoutPassword = toPublicUser(user);
  return res.redirect(`${FRONTEND_URL}/oauth-callback?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}&token=${token}`);
};

for (const provider of Object.keys(OAUTH_PROVIDERS)) {
  app.get(`/auth/${provider}`, requireProvider(provider), startOAuth(provider));
  app.get(`/auth/${provider}/callback`, requireProvider(provider), oauthCallback(provider), finishOAuth(provider));
}

// Route de test pour l'authentification
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user,
  });
});

// Middleware pour les routes non trouvées (404)
app.use(notFound);

// Middleware de gestion d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Les gros fichiers peuvent dépasser le délai par défaut de Node (5 minutes par requête)
server.requestTimeout = 2 * 60 * 60 * 1000;
