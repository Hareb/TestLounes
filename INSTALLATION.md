# 📦 Guide d'Installation - Système de Gestion d'Auto-École

Ce guide vous accompagne pas à pas pour installer et démarrer le système de gestion d'auto-école.

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 20+ ([Télécharger](https://nodejs.org/))
- **PostgreSQL** 14+ ([Télécharger](https://www.postgresql.org/download/))
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** ([Télécharger](https://git-scm.com/))

## 🗄️ Configuration de la Base de Données

### 1. Installer PostgreSQL

Si PostgreSQL n'est pas encore installé :

**Windows :**
```bash
# Télécharger depuis https://www.postgresql.org/download/windows/
```

**macOS :**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE driving_school;

# Créer un utilisateur (optionnel)
CREATE USER autoecole_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE driving_school TO autoecole_user;

# Quitter
\q
```

## 🚀 Installation du Backend

### 1. Naviguer vers le dossier backend

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos informations
nano .env  # ou utilisez votre éditeur préféré
```

**Exemple de configuration `.env` :**

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/driving_school?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=votre-cle-secrete-tres-longue-et-complexe-changez-moi
JWT_EXPIRES_IN=7d

# Email (pour les notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Exécuter les migrations

```bash
npx prisma migrate dev --name init
```

### 6. Peupler la base de données (optionnel)

```bash
npm run prisma:seed
```

Ceci créera des données de test incluant :
- **Admin** : admin@autoecole.fr / Password123!
- **Secrétariat** : secretariat@autoecole.fr / Password123!
- **Moniteur 1** : moniteur1@autoecole.fr / Password123!
- **Moniteur 2** : moniteur2@autoecole.fr / Password123!
- **Élève 1** : eleve1@example.com / Password123!
- **Élève 2** : eleve2@example.com / Password123!

### 7. Démarrer le serveur backend

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarrera sur **http://localhost:5000**

## 💻 Installation du Frontend

### 1. Ouvrir un nouveau terminal et naviguer vers le dossier frontend

```bash
cd frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer le fichier
nano .env.local
```

**Configuration `.env.local` :**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Démarrer le serveur frontend

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

Le frontend sera accessible sur **http://localhost:3000**

## ✅ Vérification de l'Installation

### Backend

Testez l'API avec :

```bash
curl http://localhost:5000/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Auto-École Management API",
  "timestamp": "2024-XX-XX...",
  "environment": "development"
}
```

### Frontend

Ouvrez votre navigateur à l'adresse **http://localhost:3000**

Vous devriez voir la page d'accueil du système.

## 🔧 Outils de Développement

### Prisma Studio (Interface visuelle pour la BDD)

```bash
cd backend
npx prisma studio
```

Accédez à **http://localhost:5555** pour gérer visuellement vos données.

### Visualiser le schéma de base de données

```bash
cd backend
npx prisma studio
```

## 🐛 Résolution des Problèmes

### Erreur : "Cannot connect to database"

- Vérifiez que PostgreSQL est démarré
- Vérifiez votre `DATABASE_URL` dans `.env`
- Testez la connexion : `psql -U postgres -d driving_school`

### Erreur : "Port already in use"

- Backend (5000) : Changez le `PORT` dans `.env`
- Frontend (3000) : Le port sera automatiquement changé en 3001

### Erreur : "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Problème de migration Prisma

```bash
# Reset complet de la base de données (ATTENTION : efface toutes les données)
npx prisma migrate reset

# Puis re-seed
npm run prisma:seed
```

## 📚 Prochaines Étapes

1. **Connexion** : Connectez-vous avec un compte de test
2. **Exploration** : Naviguez dans les différentes sections
3. **Personnalisation** : Adaptez le système à vos besoins
4. **Documentation API** : Consultez `API.md` pour les détails des endpoints

## 🔐 Sécurité en Production

Avant de déployer en production :

1. ✅ Changez `JWT_SECRET` par une clé forte et unique
2. ✅ Utilisez des mots de passe forts pour la base de données
3. ✅ Configurez HTTPS/SSL
4. ✅ Activez les sauvegardes automatiques de la BDD
5. ✅ Configurez un pare-feu
6. ✅ Limitez les accès à la base de données
7. ✅ Activez les logs de sécurité

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation dans `README.md`
- Vérifiez les logs du serveur
- Consultez la documentation API dans `API.md`

Bon développement ! 🚗💨
