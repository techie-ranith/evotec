import { Router } from 'express';
import {
  createAdmin,
  loginAdmin,
  loginCustomer,
  refreshTokens,
  registerCustomer,
} from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAdminSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../validators/auth.schemas';

const router = Router();

router.post('/customer/register', validate(registerSchema), registerCustomer);
router.post('/customer/login', validate(loginSchema), loginCustomer);
router.post('/admin/login', validate(loginSchema), loginAdmin);
router.post(
  '/admin/create',
  authenticate,
  requireRole('ADMIN'),
  validate(createAdminSchema),
  createAdmin
);
router.post('/refresh', validate(refreshSchema), refreshTokens);

export default router;
