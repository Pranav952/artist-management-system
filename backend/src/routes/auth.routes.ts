import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  authController.login
);

export default router;
