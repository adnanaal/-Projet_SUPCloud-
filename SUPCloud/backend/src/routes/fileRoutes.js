const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');

// Routes protégées
router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFiles);
router.get('/:id', authMiddleware, fileController.getFile);
router.get('/:id/download', authMiddleware, fileController.downloadFile);

module.exports = router;
