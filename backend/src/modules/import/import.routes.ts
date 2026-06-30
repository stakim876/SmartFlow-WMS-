import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { uploadExcel } from '../../core/config/upload';
import { importController } from './import.controller';

const router = Router();

router.use(authenticate);

router.post(
  '/products',
  authorize('ADMIN', 'STAFF'),
  uploadExcel.single('file'),
  importController.products,
);

export default router;
