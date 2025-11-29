import { Router } from 'express';
import { logbookController } from '../controllers/logbook.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public - GDE grid details
router.get('/gde-grid', authenticateToken, logbookController.getCompetenceDetails);

// Student logbook
router.get('/student/:studentId', authenticateToken, logbookController.getByStudentId);
router.get('/student/:studentId/progress', authenticateToken, logbookController.getProgressSummary);

// Update skills (Instructor/Admin only)
router.put('/student/:studentId', authenticateToken, authorizeRoles('ADMIN', 'INSTRUCTOR'), logbookController.updateSkills);

// Validate competence (Instructor/Admin only)
router.post('/student/:studentId/validate-competence', authenticateToken, authorizeRoles('ADMIN', 'INSTRUCTOR'), logbookController.validateCompetence);

export default router;
