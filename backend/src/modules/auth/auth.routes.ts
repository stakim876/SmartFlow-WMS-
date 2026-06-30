import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import { authController } from './auth.controller';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateProfileSchema,
} from './auth.service';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/logout', validateBody(refreshSchema.partial()), authController.logout);

router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);
router.patch(
  '/password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword,
);

export default router;
