import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { inventoryController } from './inventory.controller';
import {
  adjustInventorySchema,
  inventoryListQuerySchema,
  movementListQuerySchema,
  transferInventorySchema,
} from './inventory.service';

const router = Router();

router.use(authenticate);

router.get('/warehouses', inventoryController.getWarehouses);
router.get('/locations', inventoryController.getLocations);
router.get('/movements', validateQuery(movementListQuerySchema), inventoryController.listMovements);
router.get('/', validateQuery(inventoryListQuerySchema), inventoryController.list);

router.patch(
  '/:id/adjust',
  authorize('ADMIN', 'STAFF'),
  validateBody(adjustInventorySchema),
  inventoryController.adjust,
);

router.post(
  '/transfer',
  authorize('ADMIN', 'STAFF'),
  validateBody(transferInventorySchema),
  inventoryController.transfer,
);

export default router;
