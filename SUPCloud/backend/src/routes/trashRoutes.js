const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Toutes protégées
router.get('/', authMiddleware, trashController.getTrashItems);
router.post('/:id/restore', authMiddleware, validate(schemas.byId), trashController.restoreTrashItem);
router.delete('/:id', authMiddleware, validate(schemas.byId), trashController.deleteTrashItem);
router.delete('/', authMiddleware, trashController.emptyTrash);

module.exports = router;
