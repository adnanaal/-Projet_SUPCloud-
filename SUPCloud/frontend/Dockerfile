# syntax=docker/dockerfile:1

# ---------- Construction de l'application (Vite) ----------
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Adresse du backend, vue par le NAVIGATEUR de l'utilisateur (pas par ce conteneur) :
# elle est inscrite dans les fichiers générés, il faut donc reconstruire l'image pour la changer.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Serveur web : nginx sans privilèges, fichiers statiques uniquement ----------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
