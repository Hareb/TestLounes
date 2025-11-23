import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All authenticated users
router.get('/', authenticateToken, examController.getAll);
router.get('/stats', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), examController.getStats);
router.get('/:id', authenticateToken, examController.getById);

// Admin/Secretary only
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), examController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), examController.update);
router.put('/:id/cancel', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), examController.cancel);
router.put('/:id/no-show', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), examController.markNoShow);

// Record results and send convocations
router.put('/:id/result', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), examController.recordResult);
router.post('/:id/convocation', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), examController.sendConvocation);

export default router;
