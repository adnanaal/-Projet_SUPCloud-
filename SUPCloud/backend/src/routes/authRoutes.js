const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');

// Route publique - Inscription
router.post('/register', registerLimiter, validate(schemas.register), authController.register);

// Route publique - Connexion
router.post('/login', loginLimiter, validate(schemas.login), authController.login);

// Route publique - Déconnexion
router.post('/logout', authController.logout);

module.exports = router;
