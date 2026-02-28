import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, userController.list);

router.post(
  '/',
  requireAuth,
  [
    body('first_name').isString().isLength({ min: 2 }),
    body('last_name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  userController.create
);

router.put(
  '/:id',
  requireAuth,
  [
    body('first_name').optional().isString(),
    body('last_name').optional().isString(),
    body('email').optional().isEmail(),
  ],
  userController.update
);

router.delete('/:id', requireAuth, userController.remove);

export default router;
