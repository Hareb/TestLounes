# 📡 Documentation API - Système de Gestion d'Auto-École

Base URL : `http://localhost:5000/api`

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

### POST `/auth/register`

Inscription d'un nouvel utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "0601020304",
  "role": "STUDENT"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/auth/login`

Connexion utilisateur.

**Body :**
```json
{
  "email": "admin@autoecole.fr",
  "password": "Password123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@autoecole.fr",
      "role": "ADMIN",
      ...
    },
    "token": "..."
  }
}
```

### GET `/auth/profile` 🔒

Obtenir le profil de l'utilisateur connecté.

### PUT `/auth/profile` 🔒

Mettre à jour le profil.

### POST `/auth/change-password` 🔒

Changer le mot de passe.

---

## 👥 Élèves

### GET `/students` 🔒

Obtenir la liste des élèves.

**Query params :**
- `status` : ACTIVE | COMPLETED | SUSPENDED | CANCELLED
- `formationType` : TRADITIONAL | AAC | SUPERVISED | ACCELERATED
- `search` : recherche par nom, email, NEPH
- `page` : numéro de page (défaut: 1)
- `limit` : nombre par page (défaut: 10)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "students": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### GET `/students/:id` 🔒

Obtenir un élève par ID.

### GET `/students/:id/stats` 🔒

Obtenir les statistiques d'un élève.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "progression": {
      "codeHoursPaid": 20,
      "codeHoursUsed": 12,
      "codeHoursRemaining": 8,
      "driveHoursPaid": 30,
      "driveHoursUsed": 15,
      "driveHoursRemaining": 15
    },
    "exams": {
      "codeExamPassed": true,
      "driveExamAttempts": 0
    },
    "latestEvaluation": { ... },
    "totalLessonsCompleted": 15
  }
}
```

### POST `/students` 🔒 (ADMIN, SECRETARY)

Créer un nouvel élève.

### PUT `/students/:id` 🔒 (ADMIN, SECRETARY)

Mettre à jour un élève.

### DELETE `/students/:id` 🔒 (ADMIN)

Supprimer un élève.

---

## 👨‍🏫 Moniteurs

### GET `/instructors` 🔒

Liste des moniteurs.

**Query params :**
- `status` : ACTIVE | ON_LEAVE | INACTIVE

### GET `/instructors/:id` 🔒

Obtenir un moniteur par ID.

### POST `/instructors` 🔒 (ADMIN)

Créer un moniteur.

### PUT `/instructors/:id` 🔒 (ADMIN)

Mettre à jour un moniteur.

### DELETE `/instructors/:id` 🔒 (ADMIN)

Supprimer un moniteur.

---

## 🚗 Véhicules

### GET `/vehicles` 🔒

Liste des véhicules.

**Query params :**
- `status` : AVAILABLE | IN_USE | MAINTENANCE | OUT_OF_SERVICE
- `type` : CAR_MANUAL | CAR_AUTOMATIC | MOTORCYCLE | TRUCK

### GET `/vehicles/:id` 🔒

Obtenir un véhicule par ID.

### POST `/vehicles` 🔒 (ADMIN, SECRETARY)

Créer un véhicule.

**Body :**
```json
{
  "brand": "Renault",
  "model": "Clio 5",
  "plateNumber": "AB-123-CD",
  "type": "CAR_MANUAL",
  "year": 2022,
  "mileage": 15000,
  "insuranceExpiry": "2025-12-31",
  "instructorId": "..."
}
```

### PUT `/vehicles/:id` 🔒 (ADMIN, SECRETARY)

Mettre à jour un véhicule.

### DELETE `/vehicles/:id` 🔒 (ADMIN)

Supprimer un véhicule.

---

## 📅 Leçons

### GET `/lessons` 🔒

Liste des leçons.

**Query params :**
- `studentId` : filtrer par élève
- `instructorId` : filtrer par moniteur
- `status` : SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
- `type` : CODE | DRIVE | EXAM_PREPARATION | EVALUATION
- `startDate` : date de début (ISO)
- `endDate` : date de fin (ISO)

### GET `/lessons/:id` 🔒

Obtenir une leçon par ID.

### POST `/lessons` 🔒 (ADMIN, SECRETARY, INSTRUCTOR)

Créer une leçon.

**Body :**
```json
{
  "studentId": "...",
  "instructorId": "...",
  "vehicleId": "...",
  "type": "DRIVE",
  "startTime": "2024-12-01T10:00:00Z",
  "duration": 2,
  "topic": "Circulation en ville",
  "location": "Agence"
}
```

### PUT `/lessons/:id` 🔒 (ADMIN, SECRETARY, INSTRUCTOR)

Mettre à jour une leçon.

### PATCH `/lessons/:id/cancel` 🔒

Annuler une leçon.

**Body :**
```json
{
  "cancelReason": "Élève indisponible"
}
```

### PATCH `/lessons/:id/complete` 🔒 (ADMIN, INSTRUCTOR)

Terminer une leçon.

**Body :**
```json
{
  "notes": "Excellente séance, progrès notables"
}
```

### DELETE `/lessons/:id` 🔒 (ADMIN)

Supprimer une leçon.

---

## 💳 Paiements

### GET `/payments` 🔒

Liste des paiements.

**Query params :**
- `studentId` : filtrer par élève
- `status` : PENDING | COMPLETED | FAILED | REFUNDED
- `method` : CASH | CARD | TRANSFER | CHECK | CPF | INSTALLMENT

### POST `/payments` 🔒 (ADMIN, SECRETARY)

Créer un paiement.

**Body :**
```json
{
  "studentId": "...",
  "amount": 1200,
  "method": "CARD",
  "description": "Forfait initial 30h",
  "invoiceId": "..."
}
```

### DELETE `/payments/:id` 🔒 (ADMIN)

Supprimer un paiement.

---

## 🧾 Factures

### GET `/invoices` 🔒

Liste des factures.

**Query params :**
- `studentId` : filtrer par élève
- `status` : DRAFT | SENT | PAID | OVERDUE | CANCELLED

### GET `/invoices/:id` 🔒

Obtenir une facture par ID.

### POST `/invoices` 🔒 (ADMIN, SECRETARY)

Créer une facture.

**Body :**
```json
{
  "studentId": "...",
  "items": [
    {
      "description": "Forfait code 20h",
      "quantity": 1,
      "unitPrice": 300
    },
    {
      "description": "Forfait conduite 30h",
      "quantity": 1,
      "unitPrice": 900
    }
  ],
  "dueDate": "2024-12-31"
}
```

### PUT `/invoices/:id` 🔒 (ADMIN, SECRETARY)

Mettre à jour une facture.

### DELETE `/invoices/:id` 🔒 (ADMIN)

Supprimer une facture.

---

## 📊 Dashboard

### GET `/dashboard/stats` 🔒 (ADMIN, SECRETARY)

Statistiques globales de l'auto-école.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 125,
      "activeStudents": 98,
      "totalInstructors": 5,
      "totalVehicles": 8,
      "totalLessons": 1542,
      "completedLessons": 1289,
      "totalRevenue": 156780
    },
    "examStats": [...],
    "upcomingLessons": [...],
    "recentPayments": [...],
    "monthlyRevenue": [...]
  }
}
```

### GET `/dashboard/instructor` 🔒 (INSTRUCTOR)

Tableau de bord personnel du moniteur.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "todayLessons": [...],
    "stats": {
      "totalLessons": 245,
      "completedLessons": 230,
      "totalHoursTaught": 460
    }
  }
}
```

---

## 🔑 Rôles et Permissions

| Route | ADMIN | SECRETARY | INSTRUCTOR | STUDENT |
|-------|-------|-----------|------------|---------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Students (Read) | ✅ | ✅ | ✅ | ✅ |
| Students (Write) | ✅ | ✅ | ❌ | ❌ |
| Students (Delete) | ✅ | ❌ | ❌ | ❌ |
| Instructors (Read) | ✅ | ✅ | ✅ | ✅ |
| Instructors (Write) | ✅ | ❌ | ❌ | ❌ |
| Vehicles (Read) | ✅ | ✅ | ✅ | ✅ |
| Vehicles (Write) | ✅ | ✅ | ❌ | ❌ |
| Lessons (Read) | ✅ | ✅ | ✅ | ✅ |
| Lessons (Write) | ✅ | ✅ | ✅ | ❌ |
| Payments (Read) | ✅ | ✅ | ❌ | ✅* |
| Payments (Write) | ✅ | ✅ | ❌ | ❌ |
| Invoices (Read) | ✅ | ✅ | ❌ | ✅* |
| Invoices (Write) | ✅ | ✅ | ❌ | ❌ |
| Dashboard (Stats) | ✅ | ✅ | ❌ | ❌ |
| Dashboard (Instructor) | ❌ | ❌ | ✅ | ❌ |

*uniquement ses propres données

---

## 📌 Codes de Réponse HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (données invalides)
- `401` - Unauthorized (non authentifié)
- `403` - Forbidden (permissions insuffisantes)
- `404` - Not Found
- `409` - Conflict (ex: email déjà utilisé)
- `500` - Internal Server Error

---

## 🔄 Format de Réponse Standard

**Succès :**
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

Besoin d'aide ? Consultez `INSTALLATION.md` ou `README.md`
