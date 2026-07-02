import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRead } from '../../core/middleware/auth';
import { validateQuery } from '../../core/middleware/validate';
import { exportController } from './export.controller';
import { exportDateQuerySchema } from './export.query';

const router = Router();

router.use(authenticate);

router.get('/products', authorizeRead(), exportController.products);
router.get('/inventory', authorizeRead(), exportController.inventory);
router.get('/inventory.pdf', authorizeRead(), exportController.inventoryPdf);
router.get(
  '/movements',
  authorizeRead(),
  validateQuery(exportDateQuerySchema),
  exportController.movements,
);
router.get(
  '/inbound',
  authorizeRead(),
  validateQuery(exportDateQuerySchema),
  exportController.inbound,
);
router.get(
  '/outbound',
  authorizeRead(),
  validateQuery(exportDateQuerySchema),
  exportController.outbound,
);

export default router;
