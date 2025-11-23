# 🚗 Système de Gestion d'Auto-École

Système complet de gestion d'auto-école conforme à la réglementation française. Solution professionnelle intégrant toutes les fonctionnalités essentielles pour gérer efficacement une auto-école moderne.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#-architecture-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Guide Utilisateur](#-guide-utilisateur)
- [Conformité Réglementaire](#-conformité-réglementaire)

## 🎯 Fonctionnalités

### Phase 1 - Fondations & Backend API ✅

**Gestion Complète des Entités**
- ✅ Gestion des élèves (inscription, dossier, NEPH, suivi personnalisé)
- ✅ Gestion des moniteurs avec plannings individuels
- ✅ Gestion du parc automobile (véhicules, assurances, entretien)
- ✅ Système de leçons (code, conduite, évaluation)
- ✅ Facturation et paiements multi-méthodes (CB, espèces, virement, CPF)

**API REST Complète**
- 40+ endpoints RESTful
- Authentification JWT sécurisée
- Validation des données avec Zod
- Gestion des rôles et permissions (ADMIN, SECRETARY, INSTRUCTOR, STUDENT)
- Pagination et filtrage avancé

### Phase 2 - Interface Web Moderne ✅

**Dashboards Personnalisés par Rôle**
- Dashboard Admin : Vue d'ensemble complète avec statistiques en temps réel
- Dashboard Moniteur : Planning, leçons du jour, élèves assignés
- Dashboard Élève : Progression GDE, prochaines leçons, heures restantes

**Pages de Gestion Avancées**
- Gestion des élèves (liste, recherche, pagination, CRUD)
- Gestion des moniteurs (disponibilités, spécialités)
- Gestion des véhicules (planning, maintenance)
- Système de leçons (création, modification, historique)
- Gestion des paiements (enregistrement, historique, relances)

**UX/UI Professionnelle**
- Design moderne avec Tailwind CSS
- Composants UI réutilisables (shadcn/ui)
- Navigation intuitive avec sidebar dynamique
- Système de notifications toast
- Responsive design (desktop, tablet, mobile)

### Phase 3 - Documents & Communications ✅

**Génération de Documents PDF**
- ✅ Contrats de formation conformes Loi Hamon
- ✅ Factures et reçus professionnels
- ✅ Certificats de fin de formation
- ✅ Livret d'apprentissage numérique
- ✅ Attestations diverses (présence, paiement, etc.)

**Système d'Emails Automatisés**
- ✅ Emails de bienvenue et confirmation d'inscription
- ✅ Rappels de rendez-vous automatiques
- ✅ Notifications de paiement et factures
- ✅ Alertes de formation (examens, échéances)
- ✅ Templates personnalisables

**Internationalisation (i18n)**
- ✅ Support multilingue (Français/Anglais)
- ✅ Traductions complètes de l'interface
- ✅ Changement de langue à la volée
- ✅ Formatage des dates/devises selon la locale

### Phase 4 - Fondamentaux Métier ✅

**Système de Forfaits**
- ✅ Catalogue de forfaits personnalisables (Code seul, Conduite seule, Complet, Pack heures)
- ✅ Gestion des achats de forfaits par les élèves
- ✅ Suivi automatique des heures consommées vs achetées
- ✅ Dates d'expiration et validité
- ✅ Statistiques détaillées (ventes, revenus, forfaits populaires)
- ✅ Modal de création de forfaits pour admins

**Système de Réservations (Bookings)**
- ✅ Réservation de créneaux par les élèves
- ✅ Visualisation des créneaux disponibles en temps réel
- ✅ Confirmation/Annulation par les moniteurs
- ✅ Conversion automatique réservation → leçon
- ✅ Gestion des absences (no-show)
- ✅ Filtres avancés (statut, type, date)

**Livret d'Apprentissage GDE (Grille de Compétences)**
- ✅ Implémentation complète du référentiel GDE français
- ✅ 4 compétences × 7 sous-compétences = 28 points d'évaluation
- ✅ Notation de 0 à 5 par compétence
- ✅ Validation progressive des compétences
- ✅ Calcul automatique de la progression globale
- ✅ Interface moniteur pour évaluation en temps réel
- ✅ Interface élève pour suivi de progression

**Gestion des Examens**
- ✅ Planification des examens CODE et CONDUITE
- ✅ Enregistrement des résultats (réussi/échoué, score)
- ✅ Envoi automatique de convocations par email
- ✅ Suivi des absences aux examens
- ✅ Statistiques de réussite (taux CODE, taux CONDUITE)
- ✅ Historique complet par élève
- ✅ Validation pré-examen (CODE requis avant CONDUITE)

**Compteur d'Heures Intelligent**
- ✅ Calcul en temps réel des heures restantes (Code + Conduite)
- ✅ Agrégation multi-forfaits
- ✅ Alertes visuelles si < 5h restantes
- ✅ Prise en compte des dates d'expiration
- ✅ Affichage dans dashboard élève et pages de détail

**Améliorations UX Phase 4**
- ✅ Page détails élève enrichie (6 onglets : Forfaits, Réservations, Livret GDE, Examens, Leçons, Paiements)
- ✅ Dashboards améliorés avec données Phase 4
- ✅ Recherche et filtres avancés (élèves, réservations)
- ✅ Visualisation des progressions avec barres et badges

## 🏗️ Architecture Technique

### Backend

**Stack Technologique**
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL 14+
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Language**: TypeScript 5.3+

**Structure Backend**
```
backend/
├── src/
│   ├── controllers/       # Contrôleurs HTTP (logique de route)
│   │   ├── authController.ts
│   │   ├── studentController.ts
│   │   ├── instructorController.ts
│   │   ├── lessonController.ts
│   │   ├── paymentController.ts
│   │   ├── packageController.ts    # Phase 4
│   │   ├── bookingController.ts    # Phase 4
│   │   ├── logbookController.ts    # Phase 4
│   │   └── examController.ts       # Phase 4
│   │
│   ├── services/          # Logique métier
│   │   ├── pdfService.ts
│   │   ├── emailService.ts
│   │   └── ...
│   │
│   ├── routes/            # Définition des routes API
│   │   ├── authRoutes.ts
│   │   ├── studentRoutes.ts
│   │   ├── packageRoutes.ts
│   │   └── ...
│   │
│   ├── middleware/        # Middlewares Express
│   │   ├── authMiddleware.ts
│   │   ├── roleMiddleware.ts
│   │   └── errorHandler.ts
│   │
│   └── utils/             # Utilitaires
│       ├── validators.ts
│       └── helpers.ts
│
├── prisma/
│   ├── schema.prisma      # Schéma complet (30+ modèles)
│   └── migrations/        # Historique des migrations
│
├── uploads/               # Fichiers uploadés
├── .env                   # Configuration (non versionné)
└── package.json
```

**Modèles de Données Principaux**
```prisma
// Authentification & Utilisateurs
User (id, email, password, role, firstName, lastName, phone)
├── Student (id, userId, neph, status, formationType, ...)
├── Instructor (id, userId, licenseNumber, specialties, ...)
└── Admin/Secretary

// Gestion des Formations
Lesson (id, studentId, instructorId, vehicleId, type, startTime, duration, ...)
Vehicle (id, brand, model, registrationNumber, type, status, ...)
Payment (id, studentId, amount, method, status, ...)

// Phase 4 - Fondamentaux Métier
Package (id, name, type, codeHours, driveHours, price, validityMonths, ...)
PackagePurchase (id, packageId, studentId, codeHoursBought, codeHoursUsed, ...)
Booking (id, studentId, instructorId, startTime, status, type, ...)
LearningLogbook (id, studentId, comp1_skill1...comp4_skill7, overallProgress, ...)
Exam (id, studentId, instructorId, type, examDate, result, score, ...)
```

### Frontend

**Stack Technologique**
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+
- **UI Library**: shadcn/ui (Radix UI)
- **State Management**: Zustand 4.5+
- **HTTP Client**: Axios 1.6+
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

**Structure Frontend**
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard admin
│   │       ├── student/        # Dashboard élève
│   │       ├── instructor/     # Dashboard moniteur
│   │       ├── students/       # Gestion élèves
│   │       │   ├── page.tsx    # Liste + recherche + filtres
│   │       │   └── [id]/       # Détails élève (6 onglets)
│   │       ├── instructors/
│   │       ├── vehicles/
│   │       ├── lessons/
│   │       ├── payments/
│   │       ├── packages/       # Phase 4
│   │       ├── bookings/       # Phase 4
│   │       ├── logbook/        # Phase 4
│   │       └── exams/          # Phase 4
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   │
│   │   └── hours-counter.tsx   # Phase 4
│   │
│   ├── lib/
│   │   ├── api.ts              # Services API (40+ méthodes)
│   │   ├── store.ts            # Zustand store
│   │   ├── utils.ts
│   │   └── i18n/               # Internationalisation
│   │       ├── i18n-context.tsx
│   │       └── translations/
│   │           ├── fr.ts       # 500+ clés
│   │           └── en.ts
│   │
│   ├── hooks/
│   │   └── use-toast.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
├── .env.local
└── package.json
```

## 🚀 Installation

### Prérequis

- **Node.js** 20.0.0 ou supérieur
- **PostgreSQL** 14.0 ou supérieur
- **npm** 9.0.0 ou supérieur (ou yarn/pnpm)
- **Git**

### 1. Cloner le Repository

```bash
git clone <repository-url>
cd TestLounes
```

### 2. Installation Backend

```bash
cd backend
npm install

# Créer le fichier .env depuis le template
cp .env.example .env
```

**Configurer `.env`** (backend):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/driving_school"

# JWT
JWT_SECRET="votre-secret-jwt-tres-securise-changez-moi"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Email (SendGrid, Mailgun, ou SMTP)
EMAIL_SERVICE="smtp"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="votre-email@gmail.com"
EMAIL_PASSWORD="votre-mot-de-passe"
EMAIL_FROM="Auto-École <noreply@votre-auto-ecole.fr>"

# Frontend URL (pour CORS)
FRONTEND_URL="http://localhost:3000"
```

**Initialiser la base de données**:
```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Seed avec données de test
npm run seed
```

**Lancer le serveur backend**:
```bash
npm run dev
# Le serveur démarre sur http://localhost:5000
```

### 3. Installation Frontend

```bash
cd ../frontend
npm install

# Créer le fichier .env.local
cp .env.example .env.local
```

**Configurer `.env.local`** (frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Lancer l'application frontend**:
```bash
npm run dev
# L'application démarre sur http://localhost:3000
```

### 4. Accès Initial

**Compte Admin par défaut** (créé lors du seed):
- Email: `admin@auto-ecole.fr`
- Mot de passe: `Admin123!`

**Autres comptes de test**:
- Moniteur: `moniteur@auto-ecole.fr` / `Moniteur123!`
- Élève: `eleve@auto-ecole.fr` / `Eleve123!`

⚠️ **Changez ces mots de passe en production !**

## ⚙️ Configuration

### Variables d'Environnement Backend

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret pour signer les tokens JWT | `secret-super-securise-256-bits` |
| `JWT_EXPIRES_IN` | Durée de validité des tokens | `7d`, `24h`, `30m` |
| `PORT` | Port du serveur Express | `5000` |
| `NODE_ENV` | Environnement d'exécution | `development`, `production` |
| `EMAIL_SERVICE` | Service d'email | `smtp`, `sendgrid`, `mailgun` |
| `EMAIL_HOST` | Hôte SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Port SMTP | `587`, `465` |
| `EMAIL_USER` | Utilisateur SMTP | `votre-email@gmail.com` |
| `EMAIL_PASSWORD` | Mot de passe SMTP | `votre-mot-de-passe` |
| `EMAIL_FROM` | Expéditeur par défaut | `Auto-École <noreply@...>` |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:3000` |

### Variables d'Environnement Frontend

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:5000/api` |

### Configuration de la Base de Données

Le schéma Prisma complet inclut 30+ modèles. Pour personnaliser:

1. Éditer `backend/prisma/schema.prisma`
2. Créer une migration:
   ```bash
   npx prisma migrate dev --name nom_de_votre_migration
   ```
3. Générer le client Prisma:
   ```bash
   npx prisma generate
   ```

## 📚 API Documentation

### Endpoints Principaux

#### Authentication (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription nouvel utilisateur | ❌ |
| POST | `/login` | Connexion et obtention du token JWT | ❌ |
| GET | `/profile` | Récupérer le profil de l'utilisateur connecté | ✅ |

#### Students (`/api/students`)

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des élèves (pagination, recherche, filtres) | Admin, Secretary |
| GET | `/:id` | Détails d'un élève | Admin, Secretary, Instructor |
| POST | `/` | Créer un élève | Admin, Secretary |
| PUT | `/:id` | Modifier un élève | Admin, Secretary |
| DELETE | `/:id` | Supprimer un élève | Admin |
| GET | `/:id/lessons` | Leçons de l'élève | Admin, Secretary, Instructor |
| GET | `/:id/payments` | Paiements de l'élève | Admin, Secretary |

#### Instructors (`/api/instructors`)

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des moniteurs | Admin, Secretary |
| GET | `/:id` | Détails d'un moniteur | Admin, Secretary |
| POST | `/` | Créer un moniteur | Admin |
| PUT | `/:id` | Modifier un moniteur | Admin |
| GET | `/:id/schedule` | Planning du moniteur | Admin, Secretary, Instructor |

#### Lessons (`/api/lessons`)

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des leçons (filtres: date, type, statut) | Tous |
| GET | `/:id` | Détails d'une leçon | Tous |
| POST | `/` | Créer une leçon | Admin, Secretary, Instructor |
| PUT | `/:id` | Modifier une leçon | Admin, Secretary, Instructor |
| DELETE | `/:id` | Supprimer une leçon | Admin |
| PATCH | `/:id/complete` | Marquer comme complétée | Instructor |

#### Packages (`/api/packages`) - Phase 4

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des forfaits (actifs ou tous) | Tous |
| GET | `/:id` | Détails d'un forfait | Tous |
| POST | `/` | Créer un forfait | Admin, Secretary |
| PUT | `/:id` | Modifier un forfait | Admin, Secretary |
| DELETE | `/:id` | Supprimer un forfait | Admin |
| POST | `/:id/purchase` | Acheter un forfait | Student |
| GET | `/student/:studentId` | Forfaits achetés par un élève | Tous |
| PATCH | `/:purchaseId/hours` | Mettre à jour heures utilisées | Admin, Instructor |
| GET | `/stats` | Statistiques (ventes, revenus) | Admin, Secretary |

#### Bookings (`/api/bookings`) - Phase 4

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des réservations (filtres) | Tous |
| GET | `/:id` | Détails d'une réservation | Tous |
| POST | `/` | Créer une réservation | Student |
| PATCH | `/:id/confirm` | Confirmer une réservation | Admin, Instructor |
| PATCH | `/:id/cancel` | Annuler une réservation | Tous |
| POST | `/:id/convert-to-lesson` | Convertir en leçon | Admin, Instructor |
| GET | `/available-slots` | Créneaux disponibles | Student |

#### Logbook (`/api/logbook`) - Phase 4

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/student/:studentId` | Livret GDE d'un élève | Tous |
| PATCH | `/student/:studentId/skills` | Mettre à jour compétences | Instructor |
| PATCH | `/student/:studentId/validate/:comp` | Valider une compétence | Instructor |
| GET | `/student/:studentId/gde-grid` | Grille complète GDE | Tous |

#### Exams (`/api/exams`) - Phase 4

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/` | Liste des examens (filtres) | Tous |
| GET | `/:id` | Détails d'un examen | Tous |
| POST | `/` | Planifier un examen | Admin, Secretary |
| PATCH | `/:id/result` | Enregistrer un résultat | Admin, Instructor |
| POST | `/:id/send-convocation` | Envoyer convocation | Admin, Secretary |
| PATCH | `/:id/no-show` | Marquer comme absent | Admin, Instructor |
| GET | `/stats` | Statistiques (taux de réussite) | Admin, Secretary |

### Authentification API

Toutes les routes protégées requièrent un token JWT dans le header:

```
Authorization: Bearer <votre_token_jwt>
```

**Obtenir un token**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@auto-ecole.fr","password":"Admin123!"}'
```

**Utiliser le token**:
```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Codes de Réponse

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (erreur de validation) |
| 401 | Non authentifié (token manquant/invalide) |
| 403 | Non autorisé (permissions insuffisantes) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |

### Format de Réponse Standard

**Succès**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie"
}
```

**Erreur**:
```json
{
  "success": false,
  "error": "Message d'erreur détaillé",
  "details": [ ... ]  // Optionnel (erreurs de validation)
}
```

## 👥 Guide Utilisateur

### Rôle: Admin / Direction

**Accès complet au système**

**Dashboard Admin**:
- Vue d'ensemble : élèves actifs, moniteurs, leçons complétées, revenus
- Statistiques Phase 4 : forfaits vendus, réservations en attente, taux de réussite aux examens
- Alertes : réservations à confirmer
- Graphiques de tendances

**Pages Principales**:
- **Élèves** (`/dashboard/students`):
  - Liste complète avec recherche et filtres (statut, type de formation, code)
  - Créer/Modifier/Supprimer des élèves
  - Vue détaillée avec 6 onglets (Forfaits, Réservations, Livret GDE, Examens, Leçons, Paiements)
  - Suivi des heures restantes et progression

- **Forfaits** (`/dashboard/packages`):
  - Créer des forfaits personnalisés (nom, type, heures code/conduite, prix, validité)
  - Voir les statistiques de vente
  - Modifier/Supprimer des forfaits
  - Marquer les forfaits populaires

- **Réservations** (`/dashboard/bookings`):
  - Filtrer par statut et type
  - Confirmer les réservations en attente
  - Annuler ou convertir en leçon
  - Vue calendrier

- **Examens** (`/dashboard/exams`):
  - Planifier des examens CODE et CONDUITE
  - Enregistrer les résultats (réussi/échoué, score)
  - Envoyer des convocations par email
  - Consulter les statistiques de réussite

- **Moniteurs** (`/dashboard/instructors`):
  - Gérer les plannings et disponibilités
  - Assigner des élèves

- **Véhicules** (`/dashboard/vehicles`):
  - Suivre l'état du parc automobile
  - Planifier la maintenance

- **Paiements** (`/dashboard/payments`):
  - Enregistrer les paiements
  - Éditer des factures et reçus PDF

### Rôle: Moniteur / Instructeur

**Gestion des leçons et évaluations**

**Dashboard Moniteur**:
- Planning du jour et de la semaine
- Prochaines leçons avec élèves et véhicules
- Leçons complétées récemment

**Pages Principales**:
- **Leçons** (`/dashboard/lessons`):
  - Voir son planning personnel
  - Marquer les leçons comme complétées
  - Ajouter des notes et commentaires

- **Livret GDE** (`/dashboard/logbook`):
  - Évaluer les compétences des élèves (grille GDE 4×7)
  - Noter de 0 à 5 chaque sous-compétence
  - Valider les compétences acquises
  - Suivre la progression globale

- **Réservations** (`/dashboard/bookings`):
  - Confirmer ou annuler les demandes de réservation
  - Convertir les réservations confirmées en leçons

- **Examens** (`/dashboard/exams`):
  - Consulter les examens planifiés
  - Enregistrer les résultats d'examens

### Rôle: Élève / Étudiant

**Suivi de formation et réservations**

**Dashboard Élève**:
- **Compteur d'heures** : Heures restantes de code et conduite (alerte si < 5h)
- **Prochaine réservation** : Date, heure, type, statut
- **Prochain examen** : Type (CODE/CONDUITE), date, centre
- **Progression globale** : Pourcentage de complétion GDE
- **Actions rapides** : Réserver, Acheter forfait, Voir livret, Mes examens

**Pages Principales**:
- **Forfaits** (`/dashboard/packages`):
  - **Onglet "Forfaits Disponibles"** : Catalogue avec prix, heures incluses
  - **Onglet "Mes Forfaits"** : Forfaits achetés avec suivi d'heures et dates d'expiration

- **Réservations** (`/dashboard/bookings`):
  - **Onglet "Réserver"** :
    - Sélectionner date, type de leçon (Code/Conduite/Évaluation)
    - Choisir un moniteur (optionnel)
    - Voir les créneaux disponibles
    - Réserver instantanément
  - **Onglet "Mes Réservations"** : Historique et statuts

- **Livret GDE** (`/dashboard/logbook`):
  - Voir sa progression par compétence (4 compétences principales)
  - Consulter les évaluations du moniteur
  - Suivre les compétences validées

- **Examens** (`/dashboard/exams`):
  - Voir les examens planifiés (CODE, CONDUITE)
  - Consulter les résultats passés
  - Télécharger les convocations

## 🎓 Conformité Réglementaire

### Réglementation Française

✅ **Respect du Référentiel GDE (Goals for Driver Education)**
- Grille d'évaluation des 4 compétences officielles
- 28 sous-compétences (7 par compétence)
- Notation de 0 à 5 selon le référentiel REMC

✅ **Livret d'Apprentissage Numérique**
- Conforme à l'arrêté du 13 mai 2013
- Suivi progressif de la formation
- Validation des compétences par le moniteur

✅ **Label "École de Conduite Qualité"**
- Gestion transparente des formations
- Suivi individualisé des élèves
- Statistiques de réussite disponibles

✅ **Conformité Loi Hamon**
- Contrats de formation générés automatiquement
- Mentions légales obligatoires
- Droit de rétractation

✅ **RGPD (Protection des Données)**
- Consentement explicite pour le traitement des données
- Droit d'accès, de rectification et de suppression
- Sécurisation des données personnelles (encryption JWT)

✅ **Agrément Préfectoral**
- Numéro NEPH obligatoire pour chaque élève
- Traçabilité complète des formations
- Archivage des documents

### Types de Formation Supportés

- **TRADITIONNELLE** : Formation classique B
- **AAC** : Apprentissage Anticipé de la Conduite (conduite accompagnée)
- **SUPERVISED** : Conduite supervisée
- **ACCELERATED** : Stage accéléré

### Documents Générés Conformes

- Contrat de formation (Cerfa n°12728*03)
- Factures avec mentions légales
- Certificats de fin de formation
- Attestations de présence
- Livret d'apprentissage

## 🔐 Sécurité

### Mesures Implémentées

✅ **Authentification & Autorisation**
- JWT avec expiration configurable
- Hash des mots de passe (bcrypt)
- Middleware de vérification des rôles
- Protection CSRF

✅ **Validation des Données**
- Validation côté serveur avec Zod
- Sanitization des inputs
- Protection contre les injections SQL (Prisma ORM)

✅ **Sécurité des Communications**
- HTTPS recommandé en production
- CORS configuré
- Headers de sécurité (Helmet.js recommandé)

✅ **Protection des Fichiers**
- Upload sécurisé avec validation de type
- Stockage en dehors du webroot
- Limitation de taille

### Recommandations Production

1. **Changer tous les secrets**:
   - JWT_SECRET (256 bits minimum)
   - Mots de passe par défaut
   - Credentials base de données

2. **Activer HTTPS**:
   - Certificat SSL/TLS valide
   - Redirection HTTP → HTTPS

3. **Configurer un reverse proxy**:
   - Nginx ou Apache
   - Rate limiting
   - Protection DDoS

4. **Sauvegardes automatiques**:
   - Base de données quotidienne
   - Fichiers uploadés
   - Logs

5. **Monitoring**:
   - Logs applicatifs
   - Métriques serveur
   - Alertes d'erreur

## 📦 Déploiement

### Option 1: VPS (Ubuntu 22.04)

**1. Prérequis serveur**:
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Installer Nginx (reverse proxy)
sudo apt install -y nginx

# Installer PM2 (process manager)
sudo npm install -g pm2
```

**2. Configuration PostgreSQL**:
```bash
sudo -u postgres psql
CREATE DATABASE driving_school;
CREATE USER driving_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE driving_school TO driving_user;
\q
```

**3. Déploiement backend**:
```bash
cd /var/www/driving-school/backend
npm install --production
npx prisma generate
npx prisma migrate deploy

# Lancer avec PM2
pm2 start npm --name "backend" -- start
pm2 save
pm2 startup
```

**4. Déploiement frontend**:
```bash
cd /var/www/driving-school/frontend
npm install
npm run build

# Lancer avec PM2
pm2 start npm --name "frontend" -- start
```

**5. Configuration Nginx**:
```nginx
server {
    listen 80;
    server_name votre-domaine.fr;

    # Redirection HTTPS (après obtention SSL)
    # return 301 https://$server_name$request_uri;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker

**docker-compose.yml** (à la racine):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: driving_school
      POSTGRES_USER: driving_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://driving_user:secure_password@postgres:5432/driving_school
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Lancer avec Docker**:
```bash
docker-compose up -d
```

### Option 3: Plateformes Cloud

**Backend**:
- Heroku (avec PostgreSQL add-on)
- Railway
- Render
- DigitalOcean App Platform

**Frontend**:
- Vercel (recommandé pour Next.js)
- Netlify
- Railway
- DigitalOcean App Platform

## 🧪 Tests

### Backend

```bash
cd backend
npm run test        # Tests unitaires
npm run test:e2e    # Tests d'intégration
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm run test        # Jest + React Testing Library
npm run test:e2e    # Playwright/Cypress
```

## 🛠️ Scripts Utiles

### Backend

```bash
npm run dev           # Mode développement avec hot-reload
npm run build         # Build TypeScript
npm start             # Lancer en production
npm run lint          # ESLint
npm run format        # Prettier
npm run db:studio     # Ouvrir Prisma Studio (GUI base de données)
npm run db:seed       # Peupler avec données de test
npm run db:reset      # Reset complet de la DB
```

### Frontend

```bash
npm run dev           # Mode développement
npm run build         # Build production
npm start             # Lancer le build
npm run lint          # ESLint
npm run format        # Prettier
```

## 📊 Statistiques du Projet

- **Modèles de données**: 30+
- **Endpoints API**: 80+
- **Pages frontend**: 20+
- **Composants UI**: 50+
- **Clés de traduction**: 500+
- **Lignes de code**: ~15,000+

## 🤝 Contribution

Ce projet est propriétaire. Pour toute contribution:

1. Créer une branche feature: `git checkout -b feature/ma-fonctionnalite`
2. Commiter les changements: `git commit -m 'feat: ajout de X'`
3. Pusher la branche: `git push origin feature/ma-fonctionnalite`
4. Ouvrir une Pull Request

### Conventions de Commit

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, point-virgules manquants, etc.
- `refactor:` Refactorisation du code
- `test:` Ajout de tests
- `chore:` Maintenance

## 🐛 Dépannage

### Erreur: "Cannot connect to database"

- Vérifier que PostgreSQL est démarré: `sudo systemctl status postgresql`
- Vérifier DATABASE_URL dans .env
- Tester la connexion: `psql -U driving_user -d driving_school`

### Erreur: "JWT token invalid"

- Vérifier que JWT_SECRET est identique entre backend et token
- Le token a peut-être expiré (JWT_EXPIRES_IN)
- Se reconnecter pour obtenir un nouveau token

### Erreur: "Prisma Client not generated"

```bash
cd backend
npx prisma generate
```

### Erreur: "CORS policy blocked"

- Vérifier que FRONTEND_URL dans backend/.env correspond à l'URL du frontend
- Vérifier que NEXT_PUBLIC_API_URL dans frontend/.env.local est correct

### Port déjà utilisé

```bash
# Trouver le processus sur le port 5000
lsof -i :5000
# Tuer le processus
kill -9 <PID>
```

## 📞 Support

Pour toute question technique ou fonctionnelle:
- Créer une issue GitHub
- Consulter la documentation Prisma: https://www.prisma.io/docs
- Consulter la documentation Next.js: https://nextjs.org/docs

## 📝 Licence

Propriétaire - Tous droits réservés © 2024

Ce logiciel est la propriété exclusive de [Votre Auto-École]. Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.

## 👨‍💻 Développement

**Version actuelle**: 1.0.0 (Phase 4 complétée)

**Dernière mise à jour**: Novembre 2024

Développé avec ❤️ pour moderniser la gestion des auto-écoles françaises.

---

## 🚀 Roadmap Future

### Phase 5 - Optimisation & Analytics (En cours de réflexion)

- [ ] Tableau de bord analytique avancé (graphiques, KPIs)
- [ ] Export de données (CSV, Excel)
- [ ] Optimisation automatique des plannings (IA)
- [ ] Application mobile (React Native)
- [ ] Intégration CPF complète
- [ ] Plateforme e-learning intégrée
- [ ] Notifications push en temps réel
- [ ] Module de gestion de la qualité (ISO 9001)

---

**Note**: Ce système est conçu spécifiquement pour le marché français et respecte toutes les réglementations en vigueur concernant la formation à la conduite.
