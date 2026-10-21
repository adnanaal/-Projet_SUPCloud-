const prisma = require('../config/database');
const AppError = require('../utils/AppError');

const prisma = require('../config/database');
const AppError = require('../utils/AppError');

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
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
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

    // Vérifier le quota (cette validation sera améliorée dans la Partie 3)
    const newStorageUsed = BigInt(user.storageUsed) + BigInt(file.size);
    if (newStorageUsed > user.storageLimit) {
      throw new AppError(413, 'Quota de stockage dépassé', 'QuotaExceededError');
    }

    // Créer le fichier dans la base de données
    const uploadedFile = await prisma.file.create({
      data: {
        name: file.originalname,
        size: BigInt(file.size),
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
          increment: BigInt(file.size),
        },
      },
    });

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      file: uploadedFile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un fichier par ID
 */
const getFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    res.status(200).json({
      file,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      files,
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

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError(404, 'Fichier introuvable', 'NotFoundError');
    }

    // Vérifier que le fichier appartient à l'utilisateur
    if (file.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Envoyer le fichier
    res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFile,
  getFiles,
  downloadFile,
};
