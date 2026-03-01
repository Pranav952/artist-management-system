import { z } from 'zod';

export const musicGenreEnum = z.enum(['rnb', 'country', 'classic', 'rock', 'jazz']);

export const createMusicSchema = z.object({
  params: z.object({
    artistId: z.string().regex(/^\d+$/, 'Invalid artist ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    album_name: z.string().optional().nullable(),
    genre: z.union([musicGenreEnum, z.literal('')]).optional().nullable(),
  }),
});

export const updateMusicSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid music ID'),
  }),
  body: z.object({
    title: z.union([z.string().min(1), z.literal('')]).optional(),
    album_name: z.string().optional().nullable(),
    genre: z.union([musicGenreEnum, z.literal('')]).optional().nullable(),
  }),
});

export const deleteMusicSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid music ID'),
  }),
});

export const getMusicByArtistSchema = z.object({
  params: z.object({
    artistId: z.string().regex(/^\d+$/, 'Invalid artist ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
  }),
});

export type CreateMusicInput = z.infer<typeof createMusicSchema>;
export type UpdateMusicInput = z.infer<typeof updateMusicSchema>;
export type DeleteMusicInput = z.infer<typeof deleteMusicSchema>;
export type GetMusicByArtistInput = z.infer<typeof getMusicByArtistSchema>;
