const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');

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

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const serializedUser = {
      ...user,
      storageUsed: user.storageUsed ? Number(user.storageUsed) : 0,
      storageLimit: user.storageLimit ? Number(user.storageLimit) : 32212254720,
    };

    res.status(200).json({
      user: serializedUser,
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
    const { name, email, avatar } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Si email change, vérifier qu'il n'est pas déjà utilisé
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new AppError(409, 'Cet email est déjà utilisé par un autre compte', 'ConflictError');
      }
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
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

    // Convertir les BigInt en nombres pour la sérialisation JSON
    const serializedUser = {
      ...user,
      storageUsed: user.storageUsed ? Number(user.storageUsed) : 0,
      storageLimit: user.storageLimit ? Number(user.storageLimit) : 32212254720,
    };

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: serializedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Changer le mot de passe
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation basique
    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Mot de passe actuel et nouveau mot de passe sont requis', 'ValidationError');
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 6) {
      throw new AppError(400, 'Le nouveau mot de passe doit contenir au moins 6 caractères', 'ValidationError');
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Vérifier si l'utilisateur a un mot de passe (pas OAuth2)
    if (!user.password) {
      throw new AppError(400, 'Ce compte utilise OAuth2. Le changement de mot de passe n\'est pas disponible.', 'ValidationError');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Mot de passe actuel incorrect', 'AuthenticationError');
    }

    // Vérifier que le nouveau mot de passe est différent
    if (currentPassword === newPassword) {
      throw new AppError(400, 'Le nouveau mot de passe doit être différent de l\'actuel', 'ValidationError');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: 'Mot de passe changé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnecter un compte OAuth2
 */
const disconnectOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params; // 'google' ou 'github'

    // Validation
    if (!provider || !['google', 'github'].includes(provider)) {
      throw new AppError(400, 'Provider OAuth2 invalide (google ou github requis)', 'ValidationError');
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Vérifier si l'utilisateur a ce provider OAuth2 connecté
    if (provider === 'google' && !user.googleId) {
      throw new AppError(400, 'Aucune connexion Google à déconnecter', 'ValidationError');
    }

    if (provider === 'github' && !user.githubId) {
      throw new AppError(400, 'Aucune connexion GitHub à déconnecter', 'ValidationError');
    }

    // Vérifier que l'utilisateur a un mot de passe avant de déconnecter OAuth2
    if (!user.password) {
      throw new AppError(400, 'Vous devez définir un mot de passe avant de déconnecter OAuth2', 'ValidationError');
    }

    // Mettre à jour l'utilisateur pour supprimer l'ID OAuth2
    const updateData = provider === 'google' ? { googleId: null } : { githubId: null };

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      message: `Connexion ${provider === 'google' ? 'Google' : 'GitHub'} déconnectée avec succès`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer le compte utilisateur
 */
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Vérifier le mot de passe si l'utilisateur a un mot de passe local
    if (user.password) {
      if (!password) {
        throw new AppError(400, 'Mot de passe requis pour supprimer le compte', 'ValidationError');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError(401, 'Mot de passe incorrect', 'AuthenticationError');
      }
    }

    // Supprimer l'utilisateur (cascade supprimera les fichiers, dossiers, etc.)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(200).json({
      message: 'Compte supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  disconnectOAuth,
  deleteAccount,
};
