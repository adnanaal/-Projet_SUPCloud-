const prisma = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Obtenir les informations de l'utilisateur connecté
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        storageUsed: true,
        storageLimit: true,
        googleId: true,
        githubId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le profil utilisateur
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        storageUsed: true,
        storageLimit: true,
        googleId: true,
        githubId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
};
