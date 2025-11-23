import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All authenticated users
router.get('/', authenticateToken, bookingController.getAll);
router.get('/available-slots', authenticateToken, bookingController.getAvailableSlots);
router.get('/:id', authenticateToken, bookingController.getById);

// Student routes
router.post('/', authenticateToken, authorizeRoles('STUDENT', 'ADMIN', 'SECRETARY'), bookingController.create);
router.put('/:id/cancel', authenticateToken, bookingController.cancel);

// Admin/Instructor routes
router.put('/:id/confirm', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), bookingController.confirm);
router.post('/:id/convert-to-lesson', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), bookingController.convertToLesson);
router.put('/:id/no-show', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), bookingController.markNoShow);

export default router;
