const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/auth');

// Toutes protégées
router.post('/', authMiddleware, folderController.createFolder);
router.get('/', authMiddleware, folderController.getFolders);
router.get('/:id', authMiddleware, folderController.getFolder);
router.put('/:id', authMiddleware, folderController.updateFolder);
router.delete('/:id', authMiddleware, folderController.deleteFolder);

module.exports = router;
