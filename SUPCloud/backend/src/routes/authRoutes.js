const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Route publique - Inscription
router.post('/register', authController.register);

// Route publique - Connexion
router.post('/login', authController.login);

// Route publique - Déconnexion
router.post('/logout', authController.logout);

// Route protégée - Obtenir les infos de l'utilisateur connecté
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
