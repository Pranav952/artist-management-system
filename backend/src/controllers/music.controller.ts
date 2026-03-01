import { Request, Response, NextFunction } from 'express';
import * as musicService from '../services/music.service';

export const listByArtist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artistId = Number(req.params.artistId);
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const data = await musicService.listMusicByArtist(artistId, page, limit);
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artistId = Number(req.params.artistId);
    const { title, album_name, genre } = req.body;
    const music = await musicService.createMusic(artistId, title, album_name, genre);
    return res.status(201).json(music);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { title, album_name, genre } = req.body;
    const music = await musicService.updateMusic(id, title, album_name, genre);
    return res.json(music);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await musicService.deleteMusic(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
