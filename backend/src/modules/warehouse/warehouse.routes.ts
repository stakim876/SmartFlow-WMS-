import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { warehouseController } from './warehouse.controller';
import {
  createLocationSchema,
  createWarehouseSchema,
  updateLocationSchema,
  updateWarehouseSchema,
  warehouseListQuerySchema,
} from './warehouse.service';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(warehouseListQuerySchema), warehouseController.list);
router.get('/:id', warehouseController.getById);
router.post('/', authorize('ADMIN'), validateBody(createWarehouseSchema), warehouseController.create);
router.put(
  '/:id',
  authorize('ADMIN'),
  validateBody(updateWarehouseSchema),
  warehouseController.update,
);
router.delete('/:id', authorize('ADMIN'), warehouseController.remove);

router.get('/:warehouseId/locations', warehouseController.listLocations);
router.post(
  '/:warehouseId/locations',
  authorize('ADMIN'),
  validateBody(createLocationSchema),
  warehouseController.createLocation,
);

const locationRouter = Router({ mergeParams: true });
locationRouter.use(authenticate);
locationRouter.put(
  '/:locationId',
  authorize('ADMIN'),
  validateBody(updateLocationSchema),
  warehouseController.updateLocation,
);
locationRouter.delete('/:locationId', authorize('ADMIN'), warehouseController.removeLocation);

export { locationRouter };
export default router;
