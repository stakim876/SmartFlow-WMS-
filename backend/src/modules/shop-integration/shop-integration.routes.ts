import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import { shopIntegrationController } from './shop-integration.controller';
import { fulfillOrderSchema } from './shop-integration.service';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

router.get('/status', shopIntegrationController.status);
router.get('/mappings', shopIntegrationController.listMappings);
router.get('/orders', shopIntegrationController.listOrderSyncs);
router.post('/sync-products', shopIntegrationController.syncProducts);
router.post('/push-stock', shopIntegrationController.pushStock);
router.post('/pull-orders', shopIntegrationController.pullOrders);
router.post(
  '/orders/:shopOrderId/fulfill',
  validateBody(fulfillOrderSchema),
  shopIntegrationController.fulfillOrder,
);

export default router;
