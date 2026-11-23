const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');
const { passwordCheckLimiter } = require('../middleware/rateLimit');

// Toutes les routes sont protégées
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, validate(schemas.updateProfile), userController.updateProfile);
router.put('/me/password', authMiddleware, passwordCheckLimiter, validate(schemas.changePassword), userController.changePassword);
router.post('/me/oauth/:provider/link-token', authMiddleware, userController.createOAuthLinkToken);
router.delete('/me/oauth/:provider', authMiddleware, userController.disconnectOAuth);
router.delete('/me', authMiddleware, passwordCheckLimiter, validate(schemas.deleteAccount), userController.deleteAccount);

module.exports = router;
