import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
} from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// Routes
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.get('/:id/stats', getStudentStats);
router.post('/', authorize('ADMIN', 'SECRETARY'), createStudent);
router.put('/:id', authorize('ADMIN', 'SECRETARY'), updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent);

export default router;
