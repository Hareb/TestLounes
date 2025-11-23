import { Router } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorize('ADMIN', 'SECRETARY'), createInvoice);
router.put('/:id', authorize('ADMIN', 'SECRETARY'), updateInvoice);
router.delete('/:id', authorize('ADMIN'), deleteInvoice);

export default router;
