import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { inboundController } from './inbound.controller';
import {
  completeInboundSchema,
  createInboundSchema,
  inboundListQuerySchema,
} from './inbound.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(inboundListQuerySchema), inboundController.list);
router.post('/', authorize('ADMIN', 'STAFF'), validateBody(createInboundSchema), inboundController.create);
router.post('/:id/approve', authorize('ADMIN'), inboundController.approve);
router.post(
  '/:id/complete',
  authorize('ADMIN', 'STAFF'),
  validateBody(completeInboundSchema),
  inboundController.complete,
);
router.post('/:id/cancel', authorize('ADMIN', 'STAFF'), inboundController.cancel);

export default router;
