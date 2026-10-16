const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Toutes les routes sont protégées
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateProfile);

module.exports = router;
