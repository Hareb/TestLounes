# 🤝 Guide de Contribution

Merci de contribuer au système de gestion d'auto-école ! Ce guide vous aidera à bien démarrer.

## 📁 Structure du Projet

```
driving-school-management/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── controllers/       # Logique des routes
│   │   ├── middleware/        # Middlewares Express
│   │   ├── routes/           # Définition des routes
│   │   ├── services/         # Logique métier
│   │   ├── utils/            # Utilitaires
│   │   └── server.ts         # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma de BDD
│   │   └── seed.ts           # Données de test
│   └── package.json
│
├── frontend/                  # Application Web
│   ├── src/
│   │   ├── app/              # Pages Next.js
│   │   ├── components/       # Composants React
│   │   ├── lib/              # Librairies et utils
│   │   └── hooks/            # Hooks personnalisés
│   └── package.json
│
├── README.md                 # Documentation principale
├── INSTALLATION.md           # Guide d'installation
├── API.md                    # Documentation API
└── CONTRIBUTING.md           # Ce fichier
```

## 🔧 Configuration de l'Environnement de Développement

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd driving-school-management
```

### 2. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurer les variables d'environnement

Suivez les instructions dans `INSTALLATION.md`

## 💻 Workflow de Développement

### Créer une nouvelle branche

```bash
git checkout -b feature/nom-de-la-fonctionnalite
# ou
git checkout -b fix/description-du-bug
```

### Conventions de nommage des branches

- `feature/` - Nouvelle fonctionnalité
- `fix/` - Correction de bug
- `refactor/` - Refactoring de code
- `docs/` - Documentation
- `test/` - Tests

### Faire des commits

Utilisez des messages de commit clairs et descriptifs :

```bash
git commit -m "feat: ajout de la gestion des absences élèves"
git commit -m "fix: correction du calcul des heures restantes"
git commit -m "docs: mise à jour de l'API documentation"
```

**Format des commits :**
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, points-virgules manquants, etc.
- `refactor:` - Refactoring de code
- `test:` - Ajout de tests
- `chore:` - Tâches de maintenance

## 🎨 Standards de Code

### TypeScript

- Utilisez TypeScript strict mode
- Définissez des types pour toutes les fonctions
- Évitez `any` autant que possible

### Backend

```typescript
// ✅ Bon
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email } = req.body;
    // ...
  } catch (error) {
    // Gestion d'erreur
  }
};

// ❌ Mauvais
export const createStudent = async (req, res) => {
  const data = req.body;
  // ...
};
```

### Frontend

```typescript
// ✅ Bon
interface StudentProps {
  id: string;
  firstName: string;
  lastName: string;
}

export function StudentCard({ id, firstName, lastName }: StudentProps) {
  // ...
}

// ❌ Mauvais
export function StudentCard(props: any) {
  // ...
}
```

### Formatage

Le projet utilise des conventions standard :
- Indentation : 2 espaces
- Point-virgules : oui
- Guillemets : simples pour JS/TS, doubles pour JSX
- Longueur max de ligne : 100 caractères

## 🧪 Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## 📝 Documentation

Documentez toujours :

1. **Fonctions complexes** avec des commentaires JSDoc
2. **Nouvelles routes API** dans `API.md`
3. **Nouvelles fonctionnalités** dans `README.md`
4. **Changements de configuration** dans `INSTALLATION.md`

Exemple JSDoc :

```typescript
/**
 * Crée un nouvel élève et son compte utilisateur
 * @param req - Requête Express contenant les données de l'élève
 * @param res - Réponse Express
 * @returns Promise<void>
 */
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  // ...
}
```

## 🔍 Checklist avant Pull Request

- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] La documentation est à jour
- [ ] Le code respecte les conventions
- [ ] Les nouvelles routes API sont documentées dans `API.md`
- [ ] Les migrations Prisma sont incluses (si applicable)
- [ ] Aucune donnée sensible (mots de passe, clés API) n'est commitée

## 🚀 Soumettre une Pull Request

1. Poussez votre branche :
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```

2. Créez une Pull Request sur GitHub

3. Remplissez le template de PR avec :
   - Description des changements
   - Type de changement (feature, fix, etc.)
   - Tests effectués
   - Captures d'écran (si UI)

## 🐛 Signaler un Bug

Créez une issue avec :
- Description claire du bug
- Étapes pour reproduire
- Comportement attendu vs actuel
- Screenshots si applicable
- Environnement (OS, Node version, etc.)

## 💡 Proposer une Fonctionnalité

Créez une issue "Feature Request" avec :
- Description de la fonctionnalité
- Cas d'usage
- Bénéfices attendus
- Maquettes ou exemples (si applicable)

## 📦 Ajout de Dépendances

Avant d'ajouter une dépendance :

1. Vérifiez qu'elle est nécessaire
2. Assurez-vous qu'elle est maintenue
3. Vérifiez la licence
4. Documentez son usage

```bash
# Backend
cd backend
npm install nom-du-package

# Frontend
cd frontend
npm install nom-du-package
```

## 🔄 Mise à Jour du Schéma de Base de Données

1. Modifiez `backend/prisma/schema.prisma`

2. Créez une migration :
   ```bash
   npx prisma migrate dev --name description_du_changement
   ```

3. Mettez à jour le seed si nécessaire

4. Documentez les changements

## 🎯 Priorités de Développement

### Phase 1 - MVP ✅
- Gestion élèves, moniteurs, véhicules
- Planning et réservations
- Facturation de base

### Phase 2 - Avancé (En cours)
- Statistiques avancées
- Intégration CPF
- Notifications automatiques
- Export de documents

### Phase 3 - Premium (Futur)
- Application mobile
- Intelligence artificielle pour optimisation planning
- Système de notation automatique
- Plateforme e-learning intégrée

## 📞 Besoin d'Aide ?

- Consultez la documentation dans `/docs`
- Lisez `INSTALLATION.md` pour les problèmes de setup
- Consultez `API.md` pour les endpoints
- Ouvrez une issue GitHub

## 🙏 Merci !

Votre contribution est précieuse. Ensemble, construisons le meilleur système de gestion d'auto-école !

---

**Bonne contribution ! 🚗💨**
