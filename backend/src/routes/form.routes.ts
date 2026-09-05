import { Router } from 'express';
import {
  createForm,
  deleteForm,
  listForms,
  updateForm,
} from '../controllers/form.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createFormSchema,
  listFormsQuerySchema,
  updateFormSchema,
} from '../validators/form.schemas';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('CUSTOMER'),
  validate(createFormSchema),
  createForm
);

router.get(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(listFormsQuerySchema, 'query'),
  listForms
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate(updateFormSchema),
  updateForm
);

router.delete('/:id', authenticate, requireRole('ADMIN'), deleteForm);

export default router;
