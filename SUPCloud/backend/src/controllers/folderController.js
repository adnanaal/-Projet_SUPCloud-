const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const serializeBigInt = require('../utils/serialize');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { resolveFilePath, collectFolderTreeIds, sumSizes, getExpirationDate } = require('../utils/trash');

/**
 * Vérifie qu'un dossier ne serait pas déplacé dans lui-même ou dans l'un de ses descendants
 */
const assertNotMovedIntoItself = async (folderId, targetParentId) => {
  let currentId = targetParentId;
  while (currentId) {
    if (currentId === folderId) {
      throw new AppError(400, "Un dossier ne peut pas être déplacé dans lui-même ou dans l'un de ses sous-dossiers", 'ValidationError');
    }
    const current = await prisma.folder.findUnique({ where: { id: currentId }, select: { parentId: true } });
    currentId = current ? current.parentId : null;
  }
};

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
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, trashItemId: null },
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
        files: { where: { trashItemId: null } },
      },
    });

    res.status(201).json({
      message: 'Dossier créé avec succès',
      folder: serializeBigInt(folder),
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

    const folder = await prisma.folder.findFirst({
      where: { id, trashItemId: null },
      include: {
        files: { where: { trashItemId: null } },
        children: { where: { trashItemId: null } },
      },
    });

    if (!folder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Chaîne des dossiers parents (de la racine jusqu'au parent direct) pour le fil d'Ariane
    const ancestors = [];
    let currentParentId = folder.parentId;
    while (currentParentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: currentParentId, trashItemId: null },
        select: { id: true, name: true, parentId: true },
      });
      if (!parent) break;
      ancestors.unshift({ id: parent.id, name: parent.name });
      currentParentId = parent.parentId;
    }

    res.status(200).json({
      folder: { ...serializeBigInt(folder), ancestors },
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
        trashItemId: null,
      },
      include: {
        files: { where: { trashItemId: null } },
        children: { where: { trashItemId: null } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      folders: serializeBigInt(folders),
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
    const existingFolder = await prisma.folder.findFirst({
      where: { id, trashItemId: null },
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
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, trashItemId: null },
      });

      if (!parentFolder) {
        throw new AppError(404, 'Dossier parent introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier parent appartient à l'utilisateur
      if (parentFolder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier parent', 'ForbiddenError');
      }

      // Empêcher les cycles (dossier déplacé dans lui-même ou un descendant)
      await assertNotMovedIntoItself(id, parentId);
    }

    // Mettre à jour le dossier
    const folder = await prisma.folder.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        files: { where: { trashItemId: null } },
        children: { where: { trashItemId: null } },
      },
    });

    res.status(200).json({
      message: 'Dossier mis à jour avec succès',
      folder: serializeBigInt(folder),
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
    const existingFolder = await prisma.folder.findFirst({
      where: { id, trashItemId: null },
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
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, trashItemId: null },
      });

      if (!parentFolder) {
        throw new AppError(404, 'Dossier parent introuvable', 'NotFoundError');
      }

      // Vérifier que le dossier parent appartient à l'utilisateur
      if (parentFolder.userId !== req.user.id) {
        throw new AppError(403, 'Accès refusé au dossier parent', 'ForbiddenError');
      }

      // Empêcher les cycles (dossier déplacé dans lui-même ou un descendant)
      await assertNotMovedIntoItself(id, parentId);
    }

    // Mettre à jour le dossier parent
    const folder = await prisma.folder.update({
      where: { id },
      data: {
        parentId: parentId || null,
      },
      include: {
        files: { where: { trashItemId: null } },
        children: { where: { trashItemId: null } },
      },
    });

    res.status(200).json({
      message: 'Dossier déplacé avec succès',
      folder: serializeBigInt(folder),
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
    const folder = await prisma.folder.findFirst({
      where: { id, trashItemId: null },
    });

    if (!folder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Dossier + sous-dossiers actifs (ceux déjà en corbeille gardent leur propre entrée)
    const folderIds = await collectFolderTreeIds(id, { onlyActive: true });

    const files = await prisma.file.findMany({
      where: { folderId: { in: folderIds }, trashItemId: null },
    });
    const totalSize = sumSizes(files);

    // Mettre toute l'arborescence à la corbeille (les fichiers physiques sont conservés
    // pour la restauration) et libérer le quota de façon atomique
    await prisma.$transaction(async (tx) => {
      const trashItem = await tx.trashItem.create({
        data: {
          name: folder.name,
          type: 'folder',
          originalId: folder.id,
          userId: req.user.id,
          expiresAt: getExpirationDate(),
        },
      });

      await tx.folder.updateMany({
        where: { id: { in: folderIds } },
        data: { trashItemId: trashItem.id },
      });

      await tx.file.updateMany({
        where: { folderId: { in: folderIds }, trashItemId: null },
        data: { trashItemId: trashItem.id },
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: { storageUsed: { decrement: totalSize } },
      });
    });

    res.status(200).json({
      message: 'Dossier mis à la corbeille avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Télécharger un dossier en ZIP
 */
const downloadFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le dossier
    const folder = await prisma.folder.findFirst({
      where: { id, trashItemId: null },
      include: {
        files: { where: { trashItemId: null } },
        children: {
          where: { trashItemId: null },
          include: {
            files: { where: { trashItemId: null } },
          },
        },
      },
    });

    if (!folder) {
      throw new AppError(404, 'Dossier introuvable', 'NotFoundError');
    }

    // Vérifier que le dossier appartient à l'utilisateur
    if (folder.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Créer un flux de sortie pour le ZIP
    res.attachment(`${folder.name}.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression maximale
    });

    // Gérer les erreurs d'archiver
    archive.on('error', (err) => {
      throw err;
    });

    // Envoyer l'archive à la réponse
    archive.pipe(res);

    // Fonction récursive pour ajouter les fichiers et sous-dossiers
    const addFolderToArchive = async (currentFolder, parentPath = '') => {
      const folderPath = path.join(parentPath, currentFolder.name);

      // Ajouter les fichiers du dossier
      for (const file of currentFolder.files) {
        const filePath = resolveFilePath(file.path);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: path.join(folderPath, file.name) });
        }
      }

      // Ajouter les sous-dossiers récursivement
      for (const childFolder of currentFolder.children) {
        const childWithData = await prisma.folder.findUnique({
          where: { id: childFolder.id },
          include: {
            files: { where: { trashItemId: null } },
            children: {
              where: { trashItemId: null },
              include: {
                files: { where: { trashItemId: null } },
              },
            },
          },
        });
        await addFolderToArchive(childWithData, folderPath);
      }
    };

    // Ajouter le dossier et ses sous-dossiers à l'archive
    await addFolderToArchive(folder);

    // Finaliser l'archive
    archive.finalize();
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
  downloadFolder,
};
