import { Router } from 'express';
import { body } from 'express-validator';
import * as artistController from '../controllers/artist.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, artistController.list);

router.post(
  '/',
  requireAuth,
  [body('name').isString().isLength({ min: 1 }), body('gender').optional().isIn(['male', 'female', 'other'])],
  artistController.create
);

router.put(
  '/:id',
  requireAuth,
  [body('name').optional().isString(), body('gender').optional().isIn(['male', 'female', 'other'])],
  artistController.update
);

router.delete('/:id', requireAuth, artistController.remove);

export default router;
