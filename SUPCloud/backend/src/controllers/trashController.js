const prisma = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Récupérer tous les éléments de la corbeille de l'utilisateur
 */
const getTrashItems = async (req, res, next) => {
  try {
    const trashItems = await prisma.trashItem.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      trashItems,
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
    const { id } = req.params;

    // Récupérer l'élément de la corbeille
    const trashItem = await prisma.trashItem.findUnique({
      where: { id },
    });

    if (!trashItem) {
      throw new AppError(404, 'Élément introuvable dans la corbeille', 'NotFoundError');
    }

    // Vérifier que l'élément appartient à l'utilisateur
    if (trashItem.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Restaurer selon le type
    if (trashItem.type === 'file') {
      // Pour un fichier, on ne peut pas restaurer sans avoir gardé le fichier physique
      // Pour l'instant, on retourne une erreur car le fichier physique a été supprimé
      throw new AppError(400, 'La restauration de fichiers n\'est pas disponible pour le moment', 'ValidationError');
    } else if (trashItem.type === 'folder') {
      // Pour un dossier, on ne peut pas restaurer sans avoir gardé les fichiers physiques
      throw new AppError(400, 'La restauration de dossiers n\'est pas disponible pour le moment', 'ValidationError');
    }

    // Supprimer l'élément de la corbeille
    await prisma.trashItem.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Élément restauré avec succès',
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
    const { id } = req.params;

    // Récupérer l'élément de la corbeille
    const trashItem = await prisma.trashItem.findUnique({
      where: { id },
    });

    if (!trashItem) {
      throw new AppError(404, 'Élément introuvable dans la corbeille', 'NotFoundError');
    }

    // Vérifier que l'élément appartient à l'utilisateur
    if (trashItem.userId !== req.user.id) {
      throw new AppError(403, 'Accès refusé', 'ForbiddenError');
    }

    // Supprimer l'élément de la corbeille
    await prisma.trashItem.delete({
      where: { id },
    });

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
    // Supprimer tous les éléments de la corbeille de l'utilisateur
    await prisma.trashItem.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

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
