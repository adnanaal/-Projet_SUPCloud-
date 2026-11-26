# syntax=docker/dockerfile:1

# ---------- Base commune : Node 24 (Debian) + OpenSSL, requis par le moteur Prisma ----------
FROM node:24-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---------- Dépendances de production et client Prisma ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev \
 && npx prisma generate \
 && npm cache clean --force

# ---------- Image finale ----------
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    UPLOAD_DIR=/data/uploads
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# /data/uploads (fichiers envoyés) et /data/secrets (secrets générés) sont destinés à des volumes ;
# propriétaire = utilisateur non privilégié « node » (un volume nommé neuf reprend les droits du dossier)
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
 && chmod +x /usr/local/bin/docker-entrypoint.sh \
 && mkdir -p /data/uploads /data/secrets \
 && chown -R node:node /data /app

USER node
VOLUME ["/data/uploads"]
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
