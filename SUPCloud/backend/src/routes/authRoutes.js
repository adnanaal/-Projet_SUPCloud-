const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route publique - Inscription
router.post('/register', authController.register);

// Route publique - Connexion
router.post('/login', authController.login);

// Route publique - Déconnexion
router.post('/logout', authController.logout);

module.exports = router;
