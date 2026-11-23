const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const serializeBigInt = require('../utils/serialize');

const MAX_QUERY_LENGTH = 100;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Prisma transmet « contains » à ILIKE sans échapper ses jokers : « % » et « _ » doivent rester des caractères
const escapeLikePattern = (value) => value.replace(/[\\%_]/g, '\\$&');

/**
 * Rechercher des fichiers et dossiers par nom (insensible à la casse),
 * hors corbeille, uniquement parmi ceux de l'utilisateur connecté
 */
const search = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      throw new AppError(400, 'Le terme de recherche est requis');
    }
    if (query.length > MAX_QUERY_LENGTH) {
      throw new AppError(400, `Le terme de recherche ne doit pas dépasser ${MAX_QUERY_LENGTH} caractères`);
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const where = {
      userId: req.user.id,
      trashItemId: null,
      name: { contains: escapeLikePattern(query), mode: 'insensitive' },
    };

    const [folders, files, totalFolders, totalFiles] = await Promise.all([
      prisma.folder.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: { parent: { select: { id: true, name: true } } },
      }),
      prisma.file.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: { folder: { select: { id: true, name: true } } },
      }),
      prisma.folder.count({ where }),
      prisma.file.count({ where }),
    ]);

    res.status(200).json({
      query,
      folders: serializeBigInt(folders),
      files: serializeBigInt(files),
      totalFolders,
      totalFiles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { search };
