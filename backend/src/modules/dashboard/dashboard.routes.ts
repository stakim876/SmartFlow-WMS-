import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/summary', dashboardController.summary);

export default router;
