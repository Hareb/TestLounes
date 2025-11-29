# Utiliser l'image Node.js officielle
FROM node:18-alpine

# Installer OpenSSL pour Prisma
RUN apk add --no-cache openssl libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le reste de l'application
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application TypeScript avec config production
RUN npx tsc -p tsconfig.production.json

# Exposer le port
EXPOSE 5000

# Créer le dossier uploads
RUN mkdir -p /app/uploads

# Commande pour démarrer l'application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
