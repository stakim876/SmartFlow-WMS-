import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { productController } from './product.controller';
import {
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
} from './product.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(productListQuerySchema), productController.list);
router.get('/:id', productController.getById);
router.post('/', authorize('ADMIN', 'STAFF'), validateBody(createProductSchema), productController.create);
router.put('/:id', authorize('ADMIN', 'STAFF'), validateBody(updateProductSchema), productController.update);
router.delete('/:id', authorize('ADMIN'), productController.remove);

export default router;
