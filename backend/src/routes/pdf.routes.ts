import { Router } from 'express';
import {
  generateInvoicePDF,
  generateContractPDF,
  generateCertificatePDF
} from '../controllers/pdf.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Routes PDF
router.get('/invoice/:id', authorize('ADMIN', 'SECRETARY', 'STUDENT'), generateInvoicePDF);
router.get('/contract/:id', authorize('ADMIN', 'SECRETARY'), generateContractPDF);
router.get('/certificate/:id', authorize('ADMIN', 'SECRETARY', 'STUDENT'), generateCertificatePDF);

export default router;
