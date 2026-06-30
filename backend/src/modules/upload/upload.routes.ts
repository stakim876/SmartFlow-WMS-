import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { uploadImage } from '../../core/config/upload';
import { uploadController } from './upload.controller';

const router = Router();

router.use(authenticate);

router.post(
  '/image',
  authorize('ADMIN', 'STAFF'),
  uploadImage.single('file'),
  uploadController.image,
);

export default router;
