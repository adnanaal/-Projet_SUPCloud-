#!/bin/sh
set -e

SECRETS_DIR="${SECRETS_DIR:-/data/secrets}"

# Secrets : une variable d'environnement fournie par l'administrateur l'emporte ;
# sinon on lit la valeur générée au premier démarrage (service init-secrets du docker-compose).
if [ -z "$JWT_SECRET" ] && [ -f "$SECRETS_DIR/jwt_secret" ]; then
  JWT_SECRET="$(cat "$SECRETS_DIR/jwt_secret")"
  export JWT_SECRET
fi

# Adresse de la base : DATABASE_URL telle quelle, sinon construite avec le mot de passe généré
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ] && [ -f "$SECRETS_DIR/db_password" ]; then
  DATABASE_URL="postgresql://${DB_USER:-supcloud}:$(cat "$SECRETS_DIR/db_password")@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-supcloud}?schema=public"
  export DATABASE_URL
fi

# Applique les migrations de la base (idempotent) avant de démarrer le serveur.
# La base peut mettre quelques secondes à accepter les connexions : on réessaie.
attempts=0
until node_modules/.bin/prisma migrate deploy; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 30 ]; then
    echo "Impossible d'appliquer les migrations : la base de données est injoignable ou DATABASE_URL est incorrect." >&2
    exit 1
  fi
  echo "Base de données indisponible, nouvelle tentative dans 2 s ($attempts/30)..."
  sleep 2
done

# exec : le serveur devient le processus principal et reçoit directement SIGTERM (docker stop)
exec "$@"
