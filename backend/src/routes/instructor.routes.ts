import { Router } from 'express';
import {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor
} from '../controllers/instructor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllInstructors);
router.get('/:id', getInstructorById);
router.post('/', authorize('ADMIN'), createInstructor);
router.put('/:id', authorize('ADMIN'), updateInstructor);
router.delete('/:id', authorize('ADMIN'), deleteInstructor);

export default router;
