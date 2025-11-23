import { TranslationsType } from './fr'

export const en: TranslationsType = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    students: 'Students',
    instructors: 'Instructors',
    vehicles: 'Vehicles',
    planning: 'Schedule',
    payments: 'Payments',
    invoices: 'Invoices',
    settings: 'Settings',
    logout: 'Logout',
  },

  // Common
  common: {
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    noData: 'No data',
    actions: 'Actions',
    status: 'Status',
    total: 'Total',
    download: 'Download',
    send: 'Send',
    export: 'Export',
    new: 'New',
  },

  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    confirmed: 'Confirmed',
    scheduled: 'Scheduled',
    paid: 'Paid',
    unpaid: 'Unpaid',
    overdue: 'Overdue',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview of your driving school',
    activeStudents: 'Active Students',
    totalInstructors: 'Instructors',
    totalVehicles: 'Vehicles',
    completedLessons: 'Completed Lessons',
    totalRevenue: 'Total Revenue',
    successRate: 'Success Rate',
    upcomingLessons: 'Upcoming Lessons',
    recentPayments: 'Recent Payments',
    instructorDashboard: 'My Dashboard',
    studentDashboard: 'My Space',
  },

  // Students
  students: {
    title: 'Student Management',
    add: 'New Student',
    total: 'student(s) total',
    search: 'Search by name, email or registration number...',
    details: 'Student Details',
    personalInfo: 'Personal Information',
    progression: 'Progress',
    lessons: 'Lessons',
    payments: 'Payments',
    documents: 'Documents',
    evaluations: 'Evaluations',
    codeHours: 'Theory Hours',
    driveHours: 'Driving Hours',
    codeExam: 'Theory Exam',
    driveExam: 'Driving Exam',
    neph: 'Registration Number',
    formationType: 'Training Type',
  },

  // Instructors
  instructors: {
    title: 'Instructor Management',
    add: 'New Instructor',
    total: 'instructor(s) total',
    search: 'Search by name or email...',
    diploma: 'Diploma',
    weeklyHours: 'Weekly Hours',
    hoursTaught: 'Hours Taught',
    lessons: 'Lessons',
  },

  // Vehicles
  vehicles: {
    title: 'Vehicle Management',
    add: 'New Vehicle',
    total: 'vehicle(s) total',
    search: 'Search by brand, model or plate number...',
    brand: 'Brand',
    model: 'Model',
    plateNumber: 'Plate Number',
    year: 'Year',
    mileage: 'Mileage',
    type: 'Type',
    assignedInstructor: 'Assigned Instructor',
    maintenance: 'Maintenance',
    fleet: 'Vehicle Fleet',
  },

  // Planning
  planning: {
    title: 'Lesson Schedule',
    add: 'New Lesson',
    weekView: 'Weekly view',
    previousWeek: 'Previous Week',
    nextWeek: 'Next Week',
    today: 'Today',
    noLessons: 'No lessons',
    legend: 'Legend',
    lessonTypes: {
      code: 'Theory',
      drive: 'Driving',
      evaluation: 'Evaluation',
      exam: 'Exam',
    },
  },

  // Payments
  payments: {
    title: 'Payment Management',
    add: 'New Payment',
    total: 'payment(s) total',
    totalCollected: 'Total Collected',
    thisMonth: 'Payments This Month',
    pending: 'Pending',
    amount: 'Amount',
    method: 'Method',
    description: 'Description',
    date: 'Date',
    methods: {
      cash: 'Cash',
      card: 'Card',
      transfer: 'Transfer',
      check: 'Check',
      cpf: 'Training Account',
      installment: 'Installment',
    },
  },

  // Invoices
  invoices: {
    title: 'Invoice Management',
    add: 'New Invoice',
    total: 'invoice(s) total',
    number: 'Number',
    revenue: 'Total Revenue',
    pendingAmount: 'Pending',
    paidInvoices: 'Paid Invoices',
    downloadPDF: 'Download PDF',
  },

  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot password?',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already registered?',
    welcome: 'Welcome',
    accessYourSpace: 'Access your driving school space',
    createAccount: 'Create your student account',
  },

  // Messages
  messages: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    deleteConfirm: 'Are you sure you want to delete?',
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
  },
}
