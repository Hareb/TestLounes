import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', authorize('ADMIN', 'SECRETARY'), createVehicle);
router.put('/:id', authorize('ADMIN', 'SECRETARY'), updateVehicle);
router.delete('/:id', authorize('ADMIN'), deleteVehicle);

export default router;
