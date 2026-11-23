const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Toutes protégées
router.post('/', authMiddleware, validate(schemas.createFolder), folderController.createFolder);
router.get('/', authMiddleware, validate(schemas.listFolders), folderController.getFolders);
router.get('/:id', authMiddleware, validate(schemas.byId), folderController.getFolder);
router.get('/:id/download', authMiddleware, validate(schemas.byId), folderController.downloadFolder);
router.put('/:id', authMiddleware, validate(schemas.updateFolder), folderController.updateFolder);
router.patch('/:id/move', authMiddleware, validate(schemas.moveFolder), folderController.moveFolder);
router.delete('/:id', authMiddleware, validate(schemas.byId), folderController.deleteFolder);

module.exports = router;
