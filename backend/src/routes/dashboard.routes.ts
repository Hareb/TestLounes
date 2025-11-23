import { Router } from 'express';
import {
  getDashboardStats,
  getInstructorDashboard
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize('ADMIN', 'SECRETARY'), getDashboardStats);
router.get('/instructor', authorize('INSTRUCTOR'), getInstructorDashboard);

export default router;
