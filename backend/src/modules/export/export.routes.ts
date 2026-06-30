import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { exportController } from './export.controller';

const router = Router();

router.use(authenticate);

router.get('/products', authorize('ADMIN', 'STAFF'), exportController.products);
router.get('/inventory', authorize('ADMIN', 'STAFF'), exportController.inventory);
router.get('/inventory.pdf', authorize('ADMIN', 'STAFF'), exportController.inventoryPdf);
router.get('/movements', authorize('ADMIN', 'STAFF'), exportController.movements);

export default router;
