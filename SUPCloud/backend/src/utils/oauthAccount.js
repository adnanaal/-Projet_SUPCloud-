const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');

// Champ de la table users qui stocke l'identifiant du compte chez chaque fournisseur
const PROVIDER_FIELDS = {
  google: 'googleId',
  github: 'githubId',
  microsoft: 'microsoftId',
};

// Variables d'environnement qui activent chaque fournisseur : sans elles, il est simplement désactivé
const PROVIDER_ENV = {
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  github: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  microsoft: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
};

const isProviderConfigured = (provider) => (PROVIDER_ENV[provider] || []).every((name) => Boolean(process.env[name]));

/**
 * Connexion : retrouver le compte par identifiant du fournisseur d'abord (compte déjà rattaché,
 * même avec une autre adresse email), puis par email (rattachement automatique), sinon le créer.
 * Le rattachement automatique exige un email vérifié par le fournisseur : sinon n'importe qui
 * pourrait déclarer l'adresse d'un utilisateur chez un fournisseur et entrer dans son compte.
 */
const loginOrCreate = async (field, { providerId, email, emailVerified, name, avatar }) => {
  let user = await prisma.user.findFirst({ where: { [field]: providerId } });

  if (!user && email) {
    // Compte existant avec le même email (sans tenir compte de la casse)
    user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });

    if (user) {
      // Email non vérifié, ou compte déjà rattaché à un autre compte de ce fournisseur :
      // l'utilisateur doit se connecter autrement puis rattacher ce compte depuis Paramètres
      if (emailVerified !== true || user[field]) {
        return { error: 'email_in_use' };
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: { [field]: providerId, avatar: avatar || user.avatar },
      });
    }
  }

  if (!user) {
    if (!email) {
      return { error: 'failed' };
    }

    user = await prisma.user.create({
      data: { email, [field]: providerId, name, avatar },
    });
  }

  return { user };
};

/**
 * Rattachement : associer le compte du fournisseur à l'utilisateur déjà connecté,
 * quelle que soit l'adresse email utilisée chez le fournisseur.
 */
const linkProvider = async (field, userId, { providerId, avatar }) => {
  // Ce compte du fournisseur est déjà utilisé par un autre compte SUPCloud
  const owner = await prisma.user.findFirst({ where: { [field]: providerId } });
  if (owner && owner.id !== userId) {
    return { error: 'conflict' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: 'failed' };
  }

  if (user[field] === providerId) {
    return { user, linked: true };
  }

  // Un autre compte du même fournisseur est déjà rattaché : il faut d'abord le déconnecter
  if (user[field]) {
    return { error: 'already_linked' };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { [field]: providerId, avatar: user.avatar || avatar },
    });
    return { user: updated, linked: true };
  } catch (error) {
    if (error.code === 'P2002') {
      return { error: 'conflict' };
    }
    throw error;
  }
};

/**
 * Traite l'identité renvoyée par un fournisseur OAuth2 : connexion (avec jeton JWT) ou, si
 * linkUserId est fourni, rattachement au compte de cet utilisateur.
 * Retourne { user, token } | { user, linked } | { error: 'conflict' | 'already_linked' | 'failed' }
 */
const handleOAuthProfile = async (provider, identity, linkUserId) => {
  const field = PROVIDER_FIELDS[provider];
  const normalized = { ...identity, providerId: String(identity.providerId) };

  if (linkUserId) {
    return linkProvider(field, linkUserId, normalized);
  }

  const result = await loginOrCreate(field, normalized);
  if (result.error) {
    return result;
  }

  const token = generateToken({
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
  });

  return { user: result.user, token };
};

module.exports = { PROVIDER_FIELDS, isProviderConfigured, handleOAuthProfile };
