import { Router } from 'express';
import { authenticate, authorize } from '../../core/middleware/auth';
import { validateBody, validateQuery } from '../../core/middleware/validate';
import { userController } from './user.controller';
import {
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  userListQuerySchema,
} from './user.service';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/roles', userController.listRoles);
router.get('/', validateQuery(userListQuerySchema), userController.list);
router.post('/', validateBody(createUserSchema), userController.create);
router.put('/:id', validateBody(updateUserSchema), userController.update);
router.post(
  '/:id/reset-password',
  validateBody(resetUserPasswordSchema),
  userController.resetPassword,
);
router.delete('/:id', userController.remove);

export default router;
