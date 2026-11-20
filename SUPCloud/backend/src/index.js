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

// Callback OAuth2 : une erreur de la stratégie (email absent, échec de l'échange de code...) ou un refus
// ramène sur la page de connexion du frontend au lieu d'afficher une réponse JSON brute
const oauthCallback = (strategy) => (req, res, next) =>
  passport.authenticate(strategy, { session: false }, (error, data) => {
    if (error || !data) {
      console.error(`Échec de la connexion OAuth2 (${strategy}) :`, error ? error.message : 'authentification refusée');
      return res.redirect(OAUTH_FAILURE_REDIRECT);
    }
    req.user = data;
    return next();
  })(req, res, next);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', oauthCallback('google'), (req, res) => {
  const { user, token } = req.user;
  const userWithoutPassword = toPublicUser(user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/oauth-callback?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}&token=${token}`);
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', oauthCallback('github'), (req, res) => {
  const { user, token } = req.user;
  const userWithoutPassword = toPublicUser(user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/oauth-callback?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}&token=${token}`);
});

// Microsoft est optionnel : sans identifiants configurés, on revient sur la page de connexion
const microsoftEnabled = Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
const requireMicrosoft = (req, res, next) => (microsoftEnabled ? next() : res.redirect(OAUTH_FAILURE_REDIRECT));

app.get('/auth/microsoft', requireMicrosoft, passport.authenticate('microsoft', { scope: ['openid', 'profile', 'email', 'User.Read'] }));
app.get('/auth/microsoft/callback', requireMicrosoft, oauthCallback('microsoft'), (req, res) => {
  const { user, token } = req.user;
  const userWithoutPassword = toPublicUser(user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/oauth-callback?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}&token=${token}`);
});

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
