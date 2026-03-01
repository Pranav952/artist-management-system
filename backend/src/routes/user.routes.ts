import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from '../schemas/user.schema';

const router = Router();

router.get('/', requireAuth, userController.list);

router.post(
  '/',
  requireAuth,
  validate(createUserSchema),
  userController.create
);

router.put(
  '/:id',
  requireAuth,
  validate(updateUserSchema),
  userController.update
);

router.delete('/:id', requireAuth, validate(deleteUserSchema), userController.remove);

export default router;
