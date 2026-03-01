import { Router } from 'express';
import * as artistController from '../controllers/artist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createArtistSchema,
  updateArtistSchema,
  deleteArtistSchema,
  getArtistByIdSchema,
} from '../schemas/artist.schema';

const router = Router();

router.get('/', requireAuth, artistController.list);

router.get('/:id', requireAuth, validate(getArtistByIdSchema), artistController.getById);

router.post(
  '/',
  requireAuth,
  validate(createArtistSchema),
  artistController.create
);

router.put(
  '/:id',
  requireAuth,
  validate(updateArtistSchema),
  artistController.update
);

router.delete('/:id', requireAuth, validate(deleteArtistSchema), artistController.remove);

export default router;
