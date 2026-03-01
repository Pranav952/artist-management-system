import { Request, Response, NextFunction } from 'express';
import * as artistService from '../services/artist.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const data = await artistService.listArtists(page, limit);
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, dob, gender, address, first_release_year, no_of_albums_released } = req.body;
    const artist = await artistService.createArtist(name, dob, gender, address, first_release_year, no_of_albums_released);
    return res.status(201).json(artist);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, dob, gender, address, first_release_year, no_of_albums_released } = req.body;
    const artist = await artistService.updateArtist(id, name, dob, gender, address, first_release_year, no_of_albums_released);
    return res.json(artist);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await artistService.deleteArtist(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
