const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validation/schemas');

// Routes protégées
router.get('/', authMiddleware, validate(schemas.search), searchController.search);

module.exports = router;
