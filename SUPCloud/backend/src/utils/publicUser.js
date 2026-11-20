const serializeBigInt = require('./serialize');

/**
 * Représentation publique d'un utilisateur : jamais de mot de passe haché ni d'identifiants
 * bruts des fournisseurs OAuth2. À la place :
 * - hasPassword : compte avec mot de passe local (ou connexion OAuth2 uniquement)
 * - linkedProviders : fournisseurs rattachés au compte (google, github, microsoft)
 * Les BigInt sont convertis en nombres pour la sérialisation JSON.
 */
const toPublicUser = (user) => {
  if (!user) return user;

  const { password, googleId, githubId, microsoftId, ...rest } = user;

  return serializeBigInt({
    ...rest,
    hasPassword: Boolean(password),
    linkedProviders: {
      google: Boolean(googleId),
      github: Boolean(githubId),
      microsoft: Boolean(microsoftId),
    },
  });
};

module.exports = toPublicUser;
