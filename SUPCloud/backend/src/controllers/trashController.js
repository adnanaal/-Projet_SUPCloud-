const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const serializeBigInt = require('../utils/serialize');
const { sumSizes, destroyTrashItem, purgeExpiredTrash } = require('../utils/trash');

const LEGACY_ITEM_MESSAGE =
  'Cet élément ne peut pas être restauré : il a été supprimé avant la mise en place de la restauration. Vous pouvez uniquement le supprimer définitivement.';

/**
 * Récupère un élément de corbeille et vérifie qu'il appartient à l'utilisateur
 */
const findOwnedTrashItem = async (id, userId) => {
  const trashItem = await prisma.trashItem.findUnique({ where: { id } });

  if (!trashItem) {
    throw new AppError(404, 'Élément introuvable dans la corbeille', 'NotFoundError');
  }

  if (trashItem.userId !== userId) {
    throw new AppError(403, 'Accès refusé', 'ForbiddenError');
  }

  return trashItem;
};

/**
 * Vérifie que la restauration ne dépasse pas le quota de l'utilisateur
 */
const assertQuotaAvailable = async (userId, sizeToRestore) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
  }

  if (user.storageUsed + sizeToRestore > user.storageLimit) {
    throw new AppError(
      413,
      'Quota de stockage dépassé : libérez de l\'espace avant de restaurer cet élément.',
      'QuotaExceededError'
    );
  }
};

/**
 * Récupérer tous les éléments de la corbeille de l'utilisateur
 */
const getTrashItems = async (req, res, next) => {
  try {
    // Supprimer définitivement les éléments expirés
    await purgeExpiredTrash(req.user.id);

    const trashItems = await prisma.trashItem.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Enrichir les fichiers avec leur taille et type MIME
    const files = await prisma.file.findMany({
      where: { trashItemId: { in: trashItems.map((item) => item.id) } },
      select: { trashItemId: true, size: true, mimeType: true },
    });
    const filesByTrashItem = new Map(files.map((file) => [file.trashItemId, file]));

    const items = trashItems.map((item) => {
      const file = filesByTrashItem.get(item.id);
      return {
        ...item,
        size: file ? file.size : null,
        mimeType: file ? file.mimeType : null,
      };
    });

    res.status(200).json({
      trashItems: serializeBigInt(items),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restaurer un élément de la corbeille
 */
const restoreTrashItem = async (req, res, next) => {
  try {
    const trashItem = await findOwnedTrashItem(req.params.id, req.user.id);
    let restoredToRoot = false;

    if (trashItem.type === 'file') {
      const file = await prisma.file.findFirst({ where: { trashItemId: trashItem.id } });

      if (!file) {
        throw new AppError(410, LEGACY_ITEM_MESSAGE, 'GoneError');
      }

      await assertQuotaAvailable(req.user.id, file.size);

      // Si le dossier d'origine n'existe plus ou est dans la corbeille, restaurer à la racine
      let folderId = file.folderId;
      if (folderId) {
        const folder = await prisma.folder.findFirst({ where: { id: folderId, trashItemId: null } });
        if (!folder) {
          folderId = null;
          restoredToRoot = true;
        }
      }

      await prisma.$transaction([
        prisma.file.update({ where: { id: file.id }, data: { trashItemId: null, folderId } }),
        prisma.user.update({ where: { id: req.user.id }, data: { storageUsed: { increment: file.size } } }),
        prisma.trashItem.delete({ where: { id: trashItem.id } }),
      ]);
    } else {
      const rootFolder = await prisma.folder.findFirst({
        where: { id: trashItem.originalId, trashItemId: trashItem.id },
      });

      if (!rootFolder) {
        throw new AppError(410, LEGACY_ITEM_MESSAGE, 'GoneError');
      }

      const files = await prisma.file.findMany({ where: { trashItemId: trashItem.id } });
      const totalSize = sumSizes(files);

      await assertQuotaAvailable(req.user.id, totalSize);

      // Si le dossier parent n'existe plus ou est dans la corbeille, restaurer à la racine
      let parentId = rootFolder.parentId;
      if (parentId) {
        const parent = await prisma.folder.findFirst({ where: { id: parentId, trashItemId: null } });
        if (!parent) {
          parentId = null;
          restoredToRoot = true;
        }
      }

      await prisma.$transaction([
        prisma.folder.updateMany({ where: { trashItemId: trashItem.id }, data: { trashItemId: null } }),
        prisma.folder.update({ where: { id: rootFolder.id }, data: { parentId } }),
        prisma.file.updateMany({ where: { trashItemId: trashItem.id }, data: { trashItemId: null } }),
        prisma.user.update({ where: { id: req.user.id }, data: { storageUsed: { increment: totalSize } } }),
        prisma.trashItem.delete({ where: { id: trashItem.id } }),
      ]);
    }

    res.status(200).json({
      message: restoredToRoot
        ? 'Élément restauré à la racine (son dossier d\'origine n\'est plus disponible)'
        : 'Élément restauré avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer définitivement un élément de la corbeille
 */
const deleteTrashItem = async (req, res, next) => {
  try {
    const trashItem = await findOwnedTrashItem(req.params.id, req.user.id);

    await destroyTrashItem(trashItem);

    res.status(200).json({
      message: 'Élément supprimé définitivement',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vider la corbeille de l'utilisateur
 */
const emptyTrash = async (req, res, next) => {
  try {
    const trashItems = await prisma.trashItem.findMany({
      where: { userId: req.user.id },
    });

    for (const item of trashItems) {
      const stillThere = await prisma.trashItem.findUnique({ where: { id: item.id } });
      if (stillThere) {
        await destroyTrashItem(item);
      }
    }

    res.status(200).json({
      message: 'Corbeille vidée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrashItems,
  restoreTrashItem,
  deleteTrashItem,
  emptyTrash,
};
