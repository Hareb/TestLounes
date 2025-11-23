import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

export const studentService = {
  getAll: (params?: any) =>
    api.get('/students', { params }),

  getById: (id: string) =>
    api.get(`/students/${id}`),

  getStats: (id: string) =>
    api.get(`/students/${id}/stats`),

  create: (data: any) =>
    api.post('/students', data),

  update: (id: string, data: any) =>
    api.put(`/students/${id}`, data),

  delete: (id: string) =>
    api.delete(`/students/${id}`),
};

export const instructorService = {
  getAll: (params?: any) =>
    api.get('/instructors', { params }),

  getById: (id: string) =>
    api.get(`/instructors/${id}`),

  create: (data: any) =>
    api.post('/instructors', data),

  update: (id: string, data: any) =>
    api.put(`/instructors/${id}`, data),

  delete: (id: string) =>
    api.delete(`/instructors/${id}`),
};

export const vehicleService = {
  getAll: (params?: any) =>
    api.get('/vehicles', { params }),

  getById: (id: string) =>
    api.get(`/vehicles/${id}`),

  create: (data: any) =>
    api.post('/vehicles', data),

  update: (id: string, data: any) =>
    api.put(`/vehicles/${id}`, data),

  delete: (id: string) =>
    api.delete(`/vehicles/${id}`),
};

export const lessonService = {
  getAll: (params?: any) =>
    api.get('/lessons', { params }),

  getById: (id: string) =>
    api.get(`/lessons/${id}`),

  create: (data: any) =>
    api.post('/lessons', data),

  update: (id: string, data: any) =>
    api.put(`/lessons/${id}`, data),

  cancel: (id: string, reason: string) =>
    api.patch(`/lessons/${id}/cancel`, { cancelReason: reason }),

  complete: (id: string, notes: string) =>
    api.patch(`/lessons/${id}/complete`, { notes }),

  delete: (id: string) =>
    api.delete(`/lessons/${id}`),
};

export const paymentService = {
  getAll: (params?: any) =>
    api.get('/payments', { params }),

  create: (data: any) =>
    api.post('/payments', data),

  delete: (id: string) =>
    api.delete(`/payments/${id}`),
};

export const invoiceService = {
  getAll: (params?: any) =>
    api.get('/invoices', { params }),

  getById: (id: string) =>
    api.get(`/invoices/${id}`),

  create: (data: any) =>
    api.post('/invoices', data),

  update: (id: string, data: any) =>
    api.put(`/invoices/${id}`, data),

  delete: (id: string) =>
    api.delete(`/invoices/${id}`),
};

export const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getInstructorDashboard: () =>
    api.get('/dashboard/instructor'),
};

export const packageService = {
  getAll: (params?: { active?: boolean }) =>
    api.get('/packages', { params }),

  getById: (id: string) =>
    api.get(`/packages/${id}`),

  create: (data: any) =>
    api.post('/packages', data),

  update: (id: string, data: any) =>
    api.put(`/packages/${id}`, data),

  delete: (id: string) =>
    api.delete(`/packages/${id}`),

  purchase: (id: string, data: { studentId: string; pricePaid: number }) =>
    api.post(`/packages/${id}/purchase`, data),

  getStudentPackages: (studentId: string) =>
    api.get(`/packages/student/${studentId}`),

  updateUsedHours: (id: string, data: { codeHoursUsed?: number; driveHoursUsed?: number }) =>
    api.put(`/packages/purchase/${id}/hours`, data),

  getStats: () =>
    api.get('/packages/stats'),
};

export const bookingService = {
  getAll: (params?: any) =>
    api.get('/bookings', { params }),

  getById: (id: string) =>
    api.get(`/bookings/${id}`),

  create: (data: any) =>
    api.post('/bookings', data),

  confirm: (id: string, data: any) =>
    api.put(`/bookings/${id}/confirm`, data),

  cancel: (id: string, data: { cancelReason: string }) =>
    api.put(`/bookings/${id}/cancel`, data),

  convertToLesson: (id: string) =>
    api.post(`/bookings/${id}/convert-to-lesson`, {}),

  markNoShow: (id: string, data: { adminNotes: string }) =>
    api.put(`/bookings/${id}/no-show`, data),

  getAvailableSlots: (params: { date: string; instructorId?: string; type?: string }) =>
    api.get('/bookings/available-slots', { params }),
};

export const logbookService = {
  getByStudentId: (studentId: string) =>
    api.get(`/logbook/student/${studentId}`),

  getProgressSummary: (studentId: string) =>
    api.get(`/logbook/student/${studentId}/progress`),

  updateSkills: (studentId: string, data: any) =>
    api.put(`/logbook/student/${studentId}`, data),

  validateCompetence: (studentId: string, competence: number) =>
    api.post(`/logbook/student/${studentId}/validate-competence`, { competence }),

  getGDEGrid: () =>
    api.get('/logbook/gde-grid'),
};

export const examService = {
  getAll: (params?: any) =>
    api.get('/exams', { params }),

  getById: (id: string) =>
    api.get(`/exams/${id}`),

  create: (data: any) =>
    api.post('/exams', data),

  update: (id: string, data: any) =>
    api.put(`/exams/${id}`, data),

  recordResult: (id: string, data: any) =>
    api.put(`/exams/${id}/result`, data),

  sendConvocation: (id: string) =>
    api.post(`/exams/${id}/convocation`, {}),

  cancel: (id: string, notes?: string) =>
    api.put(`/exams/${id}/cancel`, { notes }),

  markNoShow: (id: string, notes?: string) =>
    api.put(`/exams/${id}/no-show`, { notes }),

  getStats: () =>
    api.get('/exams/stats'),
};
