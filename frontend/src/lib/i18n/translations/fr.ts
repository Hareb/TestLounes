export const fr = {
  // Navigation
  nav: {
    dashboard: 'Tableau de Bord',
    students: 'Élèves',
    instructors: 'Moniteurs',
    vehicles: 'Véhicules',
    planning: 'Planning',
    payments: 'Paiements',
    invoices: 'Factures',
    settings: 'Paramètres',
    logout: 'Déconnexion',
  },

  // Common
  common: {
    search: 'Rechercher',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    view: 'Voir',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    noData: 'Aucune donnée',
    actions: 'Actions',
    status: 'Statut',
    total: 'Total',
    download: 'Télécharger',
    send: 'Envoyer',
    export: 'Exporter',
    new: 'Nouveau',
  },

  // Status
  status: {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    confirmed: 'Confirmé',
    scheduled: 'Planifié',
    paid: 'Payé',
    unpaid: 'Non payé',
    overdue: 'En retard',
  },

  // Dashboard
  dashboard: {
    title: 'Tableau de Bord',
    overview: 'Vue d\'ensemble de votre auto-école',
    activeStudents: 'Élèves Actifs',
    totalInstructors: 'Moniteurs',
    totalVehicles: 'Véhicules',
    completedLessons: 'Leçons Complétées',
    totalRevenue: 'Revenu Total',
    successRate: 'Taux de Réussite',
    upcomingLessons: 'Leçons à Venir',
    recentPayments: 'Paiements Récents',
    instructorDashboard: 'Mon Tableau de Bord',
    studentDashboard: 'Mon Espace',
  },

  // Students
  students: {
    title: 'Gestion des Élèves',
    add: 'Nouvel Élève',
    total: 'élève(s) au total',
    search: 'Rechercher par nom, email ou NEPH...',
    details: 'Détails de l\'élève',
    personalInfo: 'Informations Personnelles',
    progression: 'Progression',
    lessons: 'Leçons',
    payments: 'Paiements',
    documents: 'Documents',
    evaluations: 'Évaluations',
    codeHours: 'Heures de Code',
    driveHours: 'Heures de Conduite',
    codeExam: 'Examen du Code',
    driveExam: 'Examen de Conduite',
    neph: 'NEPH',
    formationType: 'Type de Formation',
  },

  // Instructors
  instructors: {
    title: 'Gestion des Moniteurs',
    add: 'Nouveau Moniteur',
    total: 'moniteur(s) au total',
    search: 'Rechercher par nom ou email...',
    diploma: 'Diplôme',
    weeklyHours: 'Heures/Semaine',
    hoursTaught: 'Heures Enseignées',
    lessons: 'Leçons',
  },

  // Vehicles
  vehicles: {
    title: 'Gestion des Véhicules',
    add: 'Nouveau Véhicule',
    total: 'véhicule(s) au total',
    search: 'Rechercher par marque, modèle ou immatriculation...',
    brand: 'Marque',
    model: 'Modèle',
    plateNumber: 'Immatriculation',
    year: 'Année',
    mileage: 'Kilométrage',
    type: 'Type',
    assignedInstructor: 'Moniteur Assigné',
    maintenance: 'Entretien',
    fleet: 'Parc Automobile',
  },

  // Planning
  planning: {
    title: 'Planning des Leçons',
    add: 'Nouvelle Leçon',
    weekView: 'Vue hebdomadaire',
    previousWeek: 'Semaine Précédente',
    nextWeek: 'Semaine Suivante',
    today: 'Aujourd\'hui',
    noLessons: 'Aucune leçon',
    legend: 'Légende',
    lessonTypes: {
      code: 'Code',
      drive: 'Conduite',
      evaluation: 'Évaluation',
      exam: 'Examen',
    },
  },

  // Payments
  payments: {
    title: 'Gestion des Paiements',
    add: 'Nouveau Paiement',
    total: 'paiement(s) au total',
    totalCollected: 'Total Encaissé',
    thisMonth: 'Paiements ce Mois',
    pending: 'En Attente',
    amount: 'Montant',
    method: 'Méthode',
    description: 'Description',
    date: 'Date',
    methods: {
      cash: 'Espèces',
      card: 'Carte',
      transfer: 'Virement',
      check: 'Chèque',
      cpf: 'CPF',
      installment: 'Échelonné',
    },
  },

  // Invoices
  invoices: {
    title: 'Gestion des Factures',
    add: 'Nouvelle Facture',
    total: 'facture(s) au total',
    number: 'Numéro',
    revenue: 'Revenu Total',
    pendingAmount: 'En Attente',
    paidInvoices: 'Factures Payées',
    downloadPDF: 'Télécharger PDF',
  },

  // Auth
  auth: {
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Téléphone',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà inscrit ?',
    welcome: 'Bienvenue',
    accessYourSpace: 'Accédez à votre espace auto-école',
    createAccount: 'Créez votre compte élève',
  },

  // Messages
  messages: {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ?',
    saved: 'Enregistré avec succès',
    deleted: 'Supprimé avec succès',
    updated: 'Mis à jour avec succès',
    created: 'Créé avec succès',
  },
}

export type TranslationsType = typeof fr
