import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { outboundController } from './outbound.controller';
import {
  completeOutboundSchema,
  createOutboundSchema,
  outboundListQuerySchema,
} from './outbound.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(outboundListQuerySchema), outboundController.list);
router.post('/', authorize('ADMIN', 'STAFF'), validateBody(createOutboundSchema), outboundController.create);
router.post('/:id/approve', authorize('ADMIN'), outboundController.approve);
router.post(
  '/:id/complete',
  authorize('ADMIN', 'STAFF'),
  validateBody(completeOutboundSchema),
  outboundController.complete,
);
router.post('/:id/cancel', authorize('ADMIN', 'STAFF'), outboundController.cancel);

export default router;
