import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { noticeController } from './notice.controller';
import {
  createNoticeSchema,
  noticeListQuerySchema,
  updateNoticeSchema,
} from './notice.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(noticeListQuerySchema), noticeController.list);
router.get('/:id', noticeController.getById);
router.post('/', authorize('ADMIN', 'STAFF'), validateBody(createNoticeSchema), noticeController.create);
router.put('/:id', authorize('ADMIN', 'STAFF'), validateBody(updateNoticeSchema), noticeController.update);
router.delete('/:id', authorize('ADMIN'), noticeController.remove);

export default router;
