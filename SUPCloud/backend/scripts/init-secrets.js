// Génère les secrets de l'installation Docker au premier démarrage : aucun secret n'est écrit dans le dépôt.
// Chaque secret est créé une seule fois puis conservé dans le volume « secrets » (les redémarrages le réutilisent).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = process.env.SECRETS_DIR || '/data/secrets';

// jwt_secret : lu seulement par le backend. db_password : lu aussi par PostgreSQL, qui s'exécute sous un
// autre utilisateur du conteneur, donc lisible par tous (le volume n'est monté dans aucun autre conteneur).
const SECRETS = [
  { name: 'jwt_secret', mode: 0o600 },
  { name: 'db_password', mode: 0o644 },
];

fs.mkdirSync(DIR, { recursive: true });

for (const { name, mode } of SECRETS) {
  const file = path.join(DIR, name);
  if (fs.existsSync(file) && fs.statSync(file).size > 0) {
    console.log(`${name} : déjà présent, conservé`);
    continue;
  }
  fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'), { mode });
  console.log(`${name} : généré`);
}
