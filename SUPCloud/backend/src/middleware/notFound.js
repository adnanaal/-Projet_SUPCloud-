/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.path} n'existe pas`,
  });
};

module.exports = notFound;
