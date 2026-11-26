const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');
const toPublicUser = require('../utils/publicUser');
const { generateLinkToken } = require('../config/jwt');
const { PROVIDER_FIELDS, isProviderConfigured } = require('../utils/oauthAccount');
const { deletePhysicalFiles } = require('../utils/trash');

const PROVIDER_LABELS = { google: 'Google', github: 'GitHub', microsoft: 'Microsoft' };


/**
 * Obtenir les informations de l'utilisateur connecté
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    res.status(200).json({
      user: toPublicUser(user),
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
    });

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: toPublicUser(user),
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
 * Générer un jeton de rattachement pour connecter un compte Google, GitHub ou Microsoft
 * à l'utilisateur déjà connecté (le navigateur est ensuite redirigé vers le fournisseur)
 */
const createOAuthLinkToken = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const field = PROVIDER_FIELDS[provider];

    if (!field) {
      throw new AppError(400, 'Fournisseur OAuth2 invalide (google, github ou microsoft requis)', 'ValidationError');
    }

    if (!isProviderConfigured(provider)) {
      throw new AppError(400, `La connexion ${PROVIDER_LABELS[provider]} n'est pas configurée sur ce serveur`, 'ValidationError');
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    if (user[field]) {
      throw new AppError(
        409,
        `Un compte ${PROVIDER_LABELS[provider]} est déjà connecté. Déconnectez-le avant d'en connecter un autre.`,
        'ConflictError'
      );
    }

    res.status(200).json({ token: generateLinkToken(user.id, provider) });
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnecter un compte OAuth2 (Google, GitHub ou Microsoft)
 * Au moins un mode de connexion doit rester disponible (mot de passe ou autre fournisseur).
 */
const disconnectOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const field = PROVIDER_FIELDS[provider];

    // Validation
    if (!field) {
      throw new AppError(400, 'Fournisseur OAuth2 invalide (google, github ou microsoft requis)', 'ValidationError');
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    // Vérifier que ce fournisseur est bien connecté
    if (!user[field]) {
      throw new AppError(400, `Aucune connexion ${PROVIDER_LABELS[provider]} à déconnecter`, 'ValidationError');
    }

    // Vérifier qu'un autre mode de connexion restera disponible
    const remainingMethods =
      (user.password ? 1 : 0) +
      Object.values(PROVIDER_FIELDS).filter((otherField) => otherField !== field && user[otherField]).length;

    if (remainingMethods === 0) {
      throw new AppError(
        400,
        'Impossible de déconnecter votre dernier mode de connexion. Connectez un autre compte avant de déconnecter celui-ci.',
        'ValidationError'
      );
    }

    // Supprimer l'identifiant du fournisseur
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { [field]: null },
    });

    res.status(200).json({
      message: `Connexion ${PROVIDER_LABELS[provider]} déconnectée avec succès`,
      user: toPublicUser(updated),
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

    // Chemins des fichiers physiques, relevés avant la suppression des métadonnées
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      select: { path: true },
    });

    // Supprimer l'utilisateur (cascade : fichiers, dossiers et corbeille en base)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    // Puis les fichiers sur le disque : rien n'est effacé si la suppression en base échoue
    deletePhysicalFiles(files);

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
  createOAuthLinkToken,
  disconnectOAuth,
  deleteAccount,
};
