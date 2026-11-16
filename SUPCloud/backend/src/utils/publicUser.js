const serializeBigInt = require('./serialize');

/**
 * Représentation publique d'un utilisateur : jamais de mot de passe haché,
 * un indicateur hasPassword (compte avec mot de passe local ou OAuth2 seul)
 * et des valeurs JSON-safe (BigInt convertis en nombres).
 */
const toPublicUser = (user) => {
  if (!user) return user;

  const { password, ...rest } = user;

  return serializeBigInt({
    ...rest,
    hasPassword: Boolean(password),
  });
};

module.exports = toPublicUser;
