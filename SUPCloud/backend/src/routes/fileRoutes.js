const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');
const checkUploadQuota = require('../middleware/uploadQuota');

// Routes protégées
router.post('/upload', authMiddleware, checkUploadQuota, upload.single('file'), fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFiles);
router.get('/recent', authMiddleware, fileController.getRecentFiles);
router.get('/stats', authMiddleware, fileController.getStorageStats);
router.get('/:id', authMiddleware, fileController.getFile);
router.get('/:id/download', authMiddleware, fileController.downloadFile);
router.put('/:id', authMiddleware, fileController.renameFile);
router.patch('/:id/move', authMiddleware, fileController.moveFile);
router.delete('/:id', authMiddleware, fileController.deleteFile);

module.exports = router;
