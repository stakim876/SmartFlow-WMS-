import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { partnerController } from './partner.controller';
import {
  createPartnerSchema,
  partnerListQuerySchema,
  updatePartnerSchema,
} from './partner.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(partnerListQuerySchema), partnerController.list);
router.get('/:id', partnerController.getById);
router.post('/', authorize('ADMIN', 'STAFF'), validateBody(createPartnerSchema), partnerController.create);
router.put('/:id', authorize('ADMIN', 'STAFF'), validateBody(updatePartnerSchema), partnerController.update);
router.delete('/:id', authorize('ADMIN'), partnerController.remove);

export default router;
