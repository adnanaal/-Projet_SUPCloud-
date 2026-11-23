const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const checkUploadQuota = require('../middleware/uploadQuota');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Routes protégées
router.post('/upload', authMiddleware, checkUploadQuota, upload.single('file'), validate(schemas.uploadFile), fileController.uploadFile);
router.get('/', authMiddleware, validate(schemas.listFiles), fileController.getFiles);
router.get('/recent', authMiddleware, fileController.getRecentFiles);
router.get('/stats', authMiddleware, fileController.getStorageStats);
router.get('/:id', authMiddleware, validate(schemas.byId), fileController.getFile);
router.get('/:id/download', authMiddleware, validate(schemas.byId), fileController.downloadFile);
router.put('/:id', authMiddleware, validate(schemas.renameFile), fileController.renameFile);
router.patch('/:id/move', authMiddleware, validate(schemas.moveFile), fileController.moveFile);
router.delete('/:id', authMiddleware, validate(schemas.byId), fileController.deleteFile);

module.exports = router;
