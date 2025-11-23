import { Router } from 'express';
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  cancelLesson,
  completeLesson,
  deleteLesson
} from '../controllers/lesson.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllLessons);
router.get('/:id', getLessonById);
router.post('/', authorize('ADMIN', 'SECRETARY', 'INSTRUCTOR'), createLesson);
router.put('/:id', authorize('ADMIN', 'SECRETARY', 'INSTRUCTOR'), updateLesson);
router.patch('/:id/cancel', cancelLesson);
router.patch('/:id/complete', authorize('ADMIN', 'INSTRUCTOR'), completeLesson);
router.delete('/:id', authorize('ADMIN'), deleteLesson);

export default router;
