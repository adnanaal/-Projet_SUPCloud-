require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Routes OAuth2
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const { user, token } = req.user;
  const { password: _, ...userWithoutPassword } = user;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/oauth-callback?user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}&token=${token}`);
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), (req, res) => {
  const { user, token } = req.user;
  const { password: _, ...userWithoutPassword } = user;
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
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
