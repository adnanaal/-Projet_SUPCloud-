const { z } = require('zod');

// bcrypt ne prend en compte que les 72 premiers octets d'un mot de passe
const BCRYPT_MAX_BYTES = 72;

const trimmed = (value) => (typeof value === 'string' ? value.trim() : value);
// Racine (« Mes fichiers ») : le client peut envoyer null, une chaîne vide ou « null »
const emptyToNull = (value) => (value === '' || value === 'null' ? null : value);

const id = z.uuid({ error: 'Identifiant invalide' });
const optionalParentId = z.preprocess(emptyToNull, id.nullable().optional());

const email = z.preprocess(
  trimmed,
  z.email({ error: 'Adresse email invalide' }).max(254, { error: "L'adresse email est trop longue" })
);

const newPassword = z
  .string({ error: 'Le mot de passe est requis' })
  .min(6, { error: 'Le mot de passe doit contenir au moins 6 caractères' })
  .refine((value) => Buffer.byteLength(value, 'utf8') <= BCRYPT_MAX_BYTES, {
    error: `Le mot de passe ne doit pas dépasser ${BCRYPT_MAX_BYTES} octets`,
  });

// Mot de passe saisi pour vérification : pas de règle de longueur à révéler, seulement une borne
const passwordInput = z
  .string({ error: 'Le mot de passe est requis' })
  .min(1, { error: 'Le mot de passe est requis' })
  .max(1024, { error: 'Mot de passe trop long' });

const personName = z.preprocess(
  trimmed,
  z
    .string({ error: 'Le nom est requis' })
    .min(1, { error: 'Le nom est requis' })
    .max(100, { error: 'Le nom ne doit pas dépasser 100 caractères' })
);

// Nom de fichier ou de dossier : pas de séparateur de chemin (sinon une archive ZIP pourrait
// écrire hors du dossier d'extraction), ni caractère de contrôle, ni « . » / « .. »
const itemName = z.preprocess(
  trimmed,
  z
    .string({ error: 'Le nom est requis' })
    .min(1, { error: 'Le nom est requis' })
    .max(255, { error: 'Le nom ne doit pas dépasser 255 caractères' })
    .refine((value) => !/[\\/]/.test(value), { error: 'Le nom ne peut pas contenir les caractères / ou \\' })
    // eslint-disable-next-line no-control-regex
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), { error: 'Le nom contient des caractères invalides' })
    .refine((value) => value !== '.' && value !== '..', { error: 'Ce nom est réservé' })
);

const idParams = z.object({ id });

module.exports = {
  idParams,
  register: { body: z.object({ email, password: newPassword, name: personName }) },
  login: { body: z.object({ email, password: passwordInput }) },
  updateProfile: {
    body: z.object({
      name: personName.optional(),
      email: email.optional(),
      avatar: z
        .url({ protocol: /^https?$/, error: "L'avatar doit être une adresse http(s)" })
        .max(2048, { error: "L'adresse de l'avatar est trop longue" })
        .optional(),
    }),
  },
  changePassword: { body: z.object({ currentPassword: passwordInput, newPassword }) },
  deleteAccount: { body: z.object({ password: passwordInput.optional() }) },
  createFolder: { body: z.object({ name: itemName, parentId: optionalParentId }) },
  updateFolder: { params: idParams, body: z.object({ name: itemName.optional(), parentId: optionalParentId }) },
  moveFolder: { params: idParams, body: z.object({ parentId: optionalParentId }) },
  listFolders: { query: z.object({ parentId: optionalParentId }) },
  uploadFile: { body: z.object({ folderId: optionalParentId }) },
  listFiles: { query: z.object({ folderId: optionalParentId }) },
  renameFile: { params: idParams, body: z.object({ name: itemName }) },
  moveFile: { params: idParams, body: z.object({ folderId: optionalParentId }) },
  byId: { params: idParams },
  search: {
    query: z.object({
      q: z.preprocess(
        trimmed,
        z
          .string({ error: 'Le terme de recherche est requis' })
          .min(1, { error: 'Le terme de recherche est requis' })
          .max(100, { error: 'Le terme de recherche ne doit pas dépasser 100 caractères' })
      ),
      limit: z.coerce.number().int().min(1).max(100).optional().catch(undefined),
    }),
  },
};
