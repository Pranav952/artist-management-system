import { Router } from 'express';
import * as musicController from '../controllers/music.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createMusicSchema,
  updateMusicSchema,
  deleteMusicSchema,
  getMusicByArtistSchema,
} from '../schemas/music.schema';

const router = Router();

router.get(
  '/artists/:artistId/music',
  requireAuth,
  validate(getMusicByArtistSchema),
  musicController.listByArtist
);

router.post(
  '/artists/:artistId/music',
  requireAuth,
  validate(createMusicSchema),
  musicController.create
);

router.put(
  '/music/:id',
  requireAuth,
  validate(updateMusicSchema),
  musicController.update
);

router.delete(
  '/music/:id',
  requireAuth,
  validate(deleteMusicSchema),
  musicController.remove
);

export default router;
