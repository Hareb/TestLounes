import { Router } from 'express';
import {
  getAllPayments,
  createPayment,
  deletePayment
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllPayments);
router.post('/', authorize('ADMIN', 'SECRETARY'), createPayment);
router.delete('/:id', authorize('ADMIN'), deletePayment);

export default router;
