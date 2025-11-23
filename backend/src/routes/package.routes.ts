import { Router } from 'express';
import { packageController } from '../controllers/package.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public routes (authenticated)
router.get('/', authenticateToken, packageController.getAll);
router.get('/stats', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), packageController.getStats);
router.get('/:id', authenticateToken, packageController.getById);

// Admin/Secretary only routes
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), packageController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY'), packageController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), packageController.delete);

// Student package purchases
router.post('/:id/purchase', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'STUDENT'), packageController.purchase);
router.get('/student/:studentId', authenticateToken, packageController.getStudentPackages);
router.put('/purchase/:id/hours', authenticateToken, authorizeRoles('ADMIN', 'SECRETARY', 'INSTRUCTOR'), packageController.updateUsedHours);

export default router;
