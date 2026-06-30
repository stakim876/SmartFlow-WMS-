import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { purchaseOrderController } from './purchase-order.controller';
import {
  createPurchaseOrderSchema,
  purchaseOrderListQuerySchema,
} from './purchase-order.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(purchaseOrderListQuerySchema), purchaseOrderController.list);
router.post(
  '/',
  authorize('ADMIN', 'STAFF'),
  validateBody(createPurchaseOrderSchema),
  purchaseOrderController.create,
);
router.post('/:id/approve', authorize('ADMIN'), purchaseOrderController.approve);
router.post('/:id/complete', authorize('ADMIN', 'STAFF'), purchaseOrderController.complete);
router.post('/:id/cancel', authorize('ADMIN', 'STAFF'), purchaseOrderController.cancel);

export default router;
