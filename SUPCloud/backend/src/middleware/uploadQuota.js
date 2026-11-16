const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const formatBytes = require('../utils/formatBytes');

/**
 * Refuse un upload avant de recevoir le fichier si sa taille (annoncée par
 * l'en-tête Content-Length) dépasse l'espace restant de l'utilisateur.
 * Évite d'écrire inutilement plusieurs Go sur le disque.
 * Le contrôle exact est refait dans le contrôleur une fois le fichier reçu.
 */
const checkUploadQuota = async (req, res, next) => {
  try {
    const announcedSize = Number(req.headers['content-length']);

    if (!Number.isFinite(announcedSize) || announcedSize <= 0) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { storageUsed: true, storageLimit: true },
    });

    if (!user) {
      throw new AppError(404, 'Utilisateur introuvable', 'NotFoundError');
    }

    const remaining = user.storageLimit - user.storageUsed;

    if (BigInt(announcedSize) > remaining) {
      throw new AppError(
        413,
        `Quota de stockage dépassé. Espace restant : ${formatBytes(remaining > 0n ? remaining : 0n)}. Taille de l'envoi : ${formatBytes(announcedSize)}.`,
        'QuotaExceededError'
      );
    }

    next();
  } catch (error) {
    // Lire et jeter la suite de l'envoi : le fichier n'est jamais écrit sur le disque, et le
    // client (navigateur) peut terminer son envoi puis lire la réponse d'erreur au lieu de
    // subir une coupure de connexion
    req.resume();
    next(error);
  }
};

module.exports = checkUploadQuota;
