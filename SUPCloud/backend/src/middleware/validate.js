const fs = require('fs');
const AppError = require('../utils/AppError');

/**
 * Valide req.params, req.query et req.body avec des schémas Zod.
 * Les données validées (nettoyées, champs inconnus retirés) remplacent celles de la requête.
 * En cas d'erreur : réponse 400 avec le premier message et le détail par champ.
 */
const validate = (schemas) => (req, res, next) => {
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;

    const result = schemas[key].safeParse(req[key] || {});
    if (!result.success) {
      // Un fichier déjà reçu par Multer ne doit pas rester sur le disque
      if (req.file && req.file.path) fs.rm(req.file.path, { force: true }, () => {});

      const error = new AppError(400, result.error.issues[0].message, 'ValidationError');
      error.errors = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
      return next(error);
    }
    req[key] = result.data;
  }
  return next();
};

module.exports = validate;
