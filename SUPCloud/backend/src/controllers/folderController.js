const prisma = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Créer un nouveau dossier
 */
const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    // Validation
    if (!name) {
      throw new AppError(400, 'Le nom du dossier est requis', 'ValidationError');
    }

    // Vérifier si le dossier parent existe (si parentId est fourni)
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new AppError(404, 'Dossier parent introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier parent appartient à l'utilisateur
      if (parentFolder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier parent', 'ForbiddenError');
      }
    }

    // Créer le dossier
    const folder = await prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
        userId: req.user.id,
      },
      include: {
        files: true,
      },
    });

    res.status(201).json({
      message: 'Dossier créé avec succès',
      folder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un dossier par ID
 */
const getFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: true,
        children: true,
      },
    });

    if (!folder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    res.status(200).json({
      folder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les dossiers de l'utilisateur
 */
const getFolders = async (req, res, next) => {
  try {
    const { parentId } = req.query;

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
        parentId: parentId || null,
      },
      include: {
        files: true,
        children: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      folders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un dossier
 */
const updateFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    // Vérifier si le dossier existe
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!existingFolder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (existingFolder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Si on change le parent, vérifier que le nouveau parent existe
    if (parentId && parentId !== existingFolder.parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new AppError(404, 'Dossier parent introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier parent appartient à l'utilisateur
      if (parentFolder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier parent', 'ForbiddenError');
      }

      // Empêcher de mettre un dossier comme son propre parent
      if (parentId === id) {
        throw new AppError(400, 'Un dossier ne peut pas être son propre parent', 'ValidationError');
      }
    }

    // Mettre à jour le dossier
    const folder = await prisma.folder.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        files: true,
        children: true,
      },
    });

    res.status(200).json({
      message: 'Dossier mis à jour avec succès',
      folder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déplacer un dossier
 */
const moveFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body;

    // Vérifier si le dossier existe
    const existingFolder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!existingFolder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (existingFolder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Si parentId est fourni, vérifier que le nouveau parent existe
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new AppError(404, 'Dossier parent introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier parent appartient à l'utilisateur
      if (parentFolder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier parent', 'ForbiddenError');
      }

      // Empêcher de mettre un dossier comme son propre parent
      if (parentId === id) {
        throw new AppError(400, 'Un dossier ne peut pas être son propre parent', 'ValidationError');
      }
    }

    // Mettre à jour le dossier parent
    const folder = await prisma.folder.update({
      where: { id },
      data: {
        parentId: parentId || null,
      },
      include: {
        files: true,
        children: true,
      },
    });

    res.status(200).json({
      message: 'Dossier déplacé avec succès',
      folder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre un dossier à la corbeille
 */
const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérifier si le dossier existe
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: true,
      },
    });

    if (!folder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Créer un élément dans la corbeille
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expiration dans 30 jours

    await prisma.trashItem.create({
      data: {
        name: folder.name,
        type: 'folder',
        originalId: folder.id,
        userId: req.user.id,
        expiresAt,
      },
    });

    // Libérer le quota utilisateur pour tous les fichiers du dossier
    const totalSize = folder.files.reduce((sum, file) => sum + file.size, 0n);
    
    if (totalSize > 0n) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          storageUsed: {
            decrement: totalSize,
          },
        },
      });
    }

    // Supprimer les fichiers physiques du disque
    const fs = require('fs');
    const path = require('path');
    
    for (const file of folder.files) {
      const filePath = path.join(__dirname, '..', '..', file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Supprimer le dossier (Prisma supprimera automatiquement les fichiers grâce à onDelete: Cascade)
    await prisma.folder.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Dossier mis à la corbeille avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  getFolder,
  getFolders,
  updateFolder,
  moveFolder,
  deleteFolder,
};
