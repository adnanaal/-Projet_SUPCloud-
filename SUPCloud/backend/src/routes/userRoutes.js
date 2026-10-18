const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes sont protégées
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateProfile);
router.put('/me/password', authMiddleware, userController.changePassword);
router.delete('/me/oauth/:provider', authMiddleware, userController.disconnectOAuth);

module.exports = router;
