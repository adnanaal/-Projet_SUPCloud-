const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');

const TRASH_RETENTION_DAYS = 30;

/**
 * Résout le chemin physique d'un fichier (absolu ou relatif historique)
 */
const resolveFilePath = (filePath) =>
  path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', '..', filePath);

/**
 * Supprime les fichiers physiques du disque (erreurs ignorées : fichier déjà absent)
 */
const deletePhysicalFiles = (files) => {
  for (const file of files) {
    try {
      const filePath = resolveFilePath(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Impossible de supprimer le fichier physique ${file.path}:`, error);
    }
  }
};

/**
 * Retourne les ids d'un dossier et de tous ses sous-dossiers (parcours en largeur).
 * Avec onlyActive, les sous-dossiers déjà en corbeille sont ignorés.
 */
const collectFolderTreeIds = async (rootId, { onlyActive = false } = {}) => {
  const ids = [rootId];
  for (let i = 0; i < ids.length; i++) {
    const children = await prisma.folder.findMany({
      where: { parentId: ids[i], ...(onlyActive && { trashItemId: null }) },
      select: { id: true },
    });
    ids.push(...children.map((child) => child.id));
  }
  return ids;
};

const sumSizes = (files) => files.reduce((sum, file) => sum + file.size, 0n);

const getExpirationDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TRASH_RETENTION_DAYS);
  return expiresAt;
};

/**
 * Supprime définitivement le contenu rattaché à un élément de la corbeille
 * (fichiers physiques, lignes en base et entrées de corbeille imbriquées).
 * Le quota a déjà été libéré lors de la mise à la corbeille.
 */
const destroyTrashItem = async (trashItem) => {
  let files = [];
  let nestedTrashItemIds = [];

  if (trashItem.type === 'file') {
    files = await prisma.file.findMany({ where: { trashItemId: trashItem.id } });
    await prisma.$transaction([
      prisma.file.deleteMany({ where: { trashItemId: trashItem.id } }),
      prisma.trashItem.delete({ where: { id: trashItem.id } }),
    ]);
  } else {
    const rootFolder = await prisma.folder.findFirst({ where: { trashItemId: trashItem.id, id: trashItem.originalId } });
    const folderIds = rootFolder ? await collectFolderTreeIds(rootFolder.id) : [];

    files = await prisma.file.findMany({
      where: { OR: [{ trashItemId: trashItem.id }, { folderId: { in: folderIds } }] },
    });
    const folders = await prisma.folder.findMany({
      where: { OR: [{ trashItemId: trashItem.id }, { id: { in: folderIds } }] },
      select: { trashItemId: true },
    });

    nestedTrashItemIds = [
      ...new Set([...files, ...folders].map((item) => item.trashItemId).filter((id) => id && id !== trashItem.id)),
    ];

    await prisma.$transaction([
      prisma.file.deleteMany({ where: { id: { in: files.map((file) => file.id) } } }),
      prisma.folder.deleteMany({ where: { OR: [{ trashItemId: trashItem.id }, { id: { in: folderIds } }] } }),
      prisma.trashItem.deleteMany({ where: { id: { in: [trashItem.id, ...nestedTrashItemIds] } } }),
    ]);
  }

  deletePhysicalFiles(files);
};

/**
 * Purge les éléments de la corbeille dont la date d'expiration est dépassée
 */
const purgeExpiredTrash = async (userId) => {
  const expired = await prisma.trashItem.findMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  for (const item of expired) {
    const stillThere = await prisma.trashItem.findUnique({ where: { id: item.id } });
    if (stillThere) {
      await destroyTrashItem(item);
    }
  }
};

module.exports = {
  resolveFilePath,
  deletePhysicalFiles,
  collectFolderTreeIds,
  sumSizes,
  getExpirationDate,
  destroyTrashItem,
  purgeExpiredTrash,
};
