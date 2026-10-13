require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
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

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Route de test pour l'authentification
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accès autorisé',
    user: req.user,
  });
});

// Routes OAuth2 (seront implémentées plus tard)
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.json({ message: 'Authentification Google réussie' });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.json({ message: 'Authentification GitHub réussie' });
});

// Middleware pour les routes non trouvées (404)
app.use(notFound);

// Middleware de gestion d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
