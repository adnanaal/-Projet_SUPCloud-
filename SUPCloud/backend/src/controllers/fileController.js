const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const serializeBigInt = require('../utils/serialize');
const fs = require('fs');
const { resolveFilePath, getExpirationDate } = require('../utils/trash');

/**
 * Formater les octets en unités lisibles
 */
const formatBytes = (bytes) => {
  if (bytes === 0n) return '0 Bytes';
  const k = 1024n;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = BigInt(Math.floor(Math.log(Number(bytes)) / Math.log(1024)));
  return `${(bytes / BigInt(Math.pow(1024, Number(i)))).toString()} ${sizes[i]}`;
};

/**
 * Uploader un fichier
 */
const uploadFile = async (req, res, next) => {
  try {
    const { folderId } = req.body;
    const file = req.file;

    if (!file) {
      throw new AppError(400, 'Aucun fichier fourni', 'ValidationError');
    }

    // Vérifier si le dossier parent existe (si folderId est fourni)
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, trashItemId: null },
      });

      if (!folder) {
        throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier appartient à l'utilisateur
      if (folder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier', 'ForbiddenError');
      }
    }

    // Récupérer l'utilisateur actuel pour vérifier le quota
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Vérifier le quota
    const fileSize = BigInt(file.size);
    const newStorageUsed = user.storageUsed + fileSize;
    const storageRemaining = user.storageLimit - user.storageUsed;

    if (newStorageUsed > user.storageLimit) {
      const usedGB = Number(user.storageUsed) / (1024 * 1024 * 1024);
      const limitGB = Number(user.storageLimit) / (1024 * 1024 * 1024);
      const fileMB = file.size / (1024 * 1024);
      const remainingMB = Number(storageRemaining) / (1024 * 1024);

      throw new AppError(
        413,
        `Quota de stockage dépassé. Espace utilisé : ${usedGB.toFixed(2)} Go / ${limitGB.toFixed(2)} Go. Espace restant : ${remainingMB.toFixed(2)} Mo. Taille du fichier : ${fileMB.toFixed(2)} Mo.`,
        'QuotaExceededError'
      );
    }

    // Créer le fichier dans la base de données
    const uploadedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        size: fileSize,
        mimeType: file.mimetype,
        path: file.path,
        folderId: folderId || null,
        userId: req.user.id,
      },
    });

    // Mettre à jour le quota utilisateur
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        storageUsed: {
          increment: fileSize,
        },
      },
    });

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      file: serializeBigInt(uploadedFile),
    });
  } catch (error) {
    // Supprimer le fichier physique si Multer l'a déjà écrit sur disque
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression du fichier orphelin:', unlinkError);
      }
    }
    next(error);
  }
};

/**
 * Récupérer un fichier par ID
 */
const getFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: { id, trashItemId: null },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    res.status(200).json({
      file: serializeBigInt(file),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les fichiers de l'utilisateur
 */
const getFiles = async (req, res, next) => {
  try {
    const { folderId } = req.query;

    const files = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: folderId || null,
        trashItemId: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      files: serializeBigInt(files),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les fichiers récents de l'utilisateur (tous dossiers confondus)
 */
const getRecentFiles = async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id, trashItemId: null },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: { folder: { select: { id: true, name: true } } },
    });

    res.status(200).json({
      files: serializeBigInt(files),
    });
  } catch (error) {
    next(error);
  }
};

const CATEGORY_KEYS = ['images', 'videos', 'audio', 'documents', 'archives', 'others'];

/**
 * Catégorie d'un fichier selon son type MIME
 */
const getCategory = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    mimeType === 'application/msword' ||
    mimeType.startsWith('application/vnd.')
  ) {
    return 'documents';
  }
  if (/zip|rar|7z|tar|gzip/.test(mimeType)) return 'archives';
  return 'others';
};

/**
 * Statistiques de l'espace de l'utilisateur : nombre de fichiers/dossiers
 * et répartition du stockage par catégorie
 */
const getStorageStats = async (req, res, next) => {
  try {
    const [groups, totalFolders] = await Promise.all([
      prisma.file.groupBy({
        by: ['mimeType'],
        where: { userId: req.user.id, trashItemId: null },
        _sum: { size: true },
        _count: { _all: true },
      }),
      prisma.folder.count({ where: { userId: req.user.id, trashItemId: null } }),
    ]);

    const categories = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, { key, count: 0, size: 0n }]));
    for (const group of groups) {
      const category = categories[getCategory(group.mimeType)];
      category.count += group._count._all;
      category.size += group._sum.size || 0n;
    }

    const categoryList = CATEGORY_KEYS.map((key) => categories[key]);

    res.status(200).json({
      totalFiles: categoryList.reduce((sum, category) => sum + category.count, 0),
      totalFolders,
      categories: serializeBigInt(categoryList),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Télécharger un fichier
 */
const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: { id, trashItemId: null },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Envoyer le fichier
    const physicalPath = resolveFilePath(file.path);

    if (!fs.existsSync(physicalPath)) {
      throw new AppError(404, 'Le fichier physique est introuvable sur le serveur', 'NotFoundError');
    }

    res.download(physicalPath, file.name);
  } catch (error) {
    next(error);
  }
};

/**
 * Renommer un fichier
 */
const renameFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validation
    if (!name) {
      throw new AppError(400, 'Le nom du fichier est requis', 'ValidationError');
    }

    // Vérifier si le fichier existe
    const file = await prisma.file.findFirst({
      where: { id, trashItemId: null },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Mettre à jour le nom du fichier
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { name },
    });

    res.status(200).json({
      message: 'Fichier renommé avec succès',
      file: serializeBigInt(updatedFile),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déplacer un fichier
 */
const moveFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    // Vérifier si le fichier existe
    const file = await prisma.file.findFirst({
      where: { id, trashItemId: null },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Si folderId est fourni, vérifier que le dossier existe
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, trashItemId: null },
      });

      if (!folder) {
        throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier appartient à l'utilisateur
      if (folder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier', 'ForbiddenError');
      }
    }

    // Mettre à jour le dossier du fichier
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { folderId: folderId || null },
    });

    res.status(200).json({
      message: 'Fichier déplacé avec succès',
      file: serializeBigInt(updatedFile),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre un fichier à la corbeille
 */
const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le fichier avant suppression
    const file = await prisma.file.findFirst({
      where: { id, trashItemId: null },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Mettre le fichier à la corbeille (le fichier physique est conservé pour la restauration)
    // et libérer le quota de façon atomique
    await prisma.$transaction(async (tx) => {
      const trashItem = await tx.trashItem.create({
        data: {
          name: file.name,
          type: 'file',
          originalId: file.id,
          userId: req.user.id,
          expiresAt: getExpirationDate(),
        },
      });

      await tx.file.update({
        where: { id },
        data: { trashItemId: trashItem.id },
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: { storageUsed: { decrement: file.size } },
      });
    });

    res.status(200).json({
      message: 'Fichier mis à la corbeille avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFile,
  getFiles,
  getRecentFiles,
  getStorageStats,
  downloadFile,
  renameFile,
  moveFile,
  deleteFile,
};
