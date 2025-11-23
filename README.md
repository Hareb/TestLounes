# 🚗 Système de Gestion d'Auto-École

Système complet de gestion d'auto-école conforme à la réglementation française.

## 🎯 Fonctionnalités Principales

### Phase 1 - MVP ✅ COMPLÉTÉE
- ✅ Gestion des élèves (inscription, dossier, NEPH)
- ✅ Gestion des moniteurs et leurs plannings
- ✅ Système de réservation de créneaux (code + conduite)
- ✅ Suivi des heures de formation
- ✅ Gestion du parc automobile
- ✅ Facturation et paiements
- ✅ Documents administratifs automatisés

### Phase 2 - Avancé ✅ COMPLÉTÉE
- ✅ Interface complète d'authentification (Login/Register)
- ✅ Dashboard admin avec statistiques en temps réel
- ✅ Dashboard moniteur personnalisé
- ✅ Dashboard élève avec suivi de progression
- ✅ Page de gestion des élèves (liste, recherche, CRUD)
- ✅ Système de navigation avec sidebar dynamique
- ✅ Composants UI réutilisables (shadcn/ui)
- ✅ Système de notifications toast
- ✅ Gestion d'état avec Zustand
- ✅ API client avec Axios et intercepteurs

### Phase 3 - Premium (À venir)
- 📊 Génération de PDF (factures, contrats, attestations)
- 📧 Notifications email/SMS automatiques
- 📱 Application mobile React Native
- 💳 Intégration CPF complète (Mon Compte Formation)
- 🏆 Conformité label "École de conduite qualité"
- 🤖 Optimisation IA du planning
- 📚 Plateforme e-learning intégrée

## 🏗️ Architecture

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

## 📁 Structure du Projet

```
driving-school-management/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── controllers/    # Contrôleurs
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modèles Prisma
│   │   └── utils/          # Utilitaires
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   └── package.json
│
├── frontend/               # Application Web
│   ├── src/
│   │   ├── app/           # Pages Next.js (App Router)
│   │   ├── components/    # Composants réutilisables
│   │   ├── lib/           # Librairies et utilitaires
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── types/         # Types TypeScript
│   └── package.json
│
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 20+
- PostgreSQL 14+
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
npm run dev
```

## 🔐 Rôles et Permissions

- **Admin/Direction**: Accès complet au système
- **Secrétariat**: Gestion élèves, réservations, facturation
- **Moniteur**: Planning, suivi élèves, évaluations
- **Élève**: Réservation, suivi de progression, paiements

## 📊 Conformité Réglementaire

- ✅ Respect du label "École de conduite qualité"
- ✅ Agrément préfectoral
- ✅ RGPD (protection des données)
- ✅ Contrat de formation conforme Loi Hamon
- ✅ Livret d'apprentissage numérique

## 📝 Licence

Propriétaire - Tous droits réservés

## 👥 Auteur

Développé pour la gestion moderne des auto-écoles françaises.
