import { z } from 'zod';

export const artistGenderEnum = z.enum(['male', 'female', 'other']);

export const createArtistSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    dob: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')]).optional().nullable(),
    gender: z.union([artistGenderEnum, z.literal('')]).optional().nullable(),
    address: z.string().optional().nullable(),
    first_release_year: z
      .number()
      .int()
      .min(1800, 'First release year must be at least 1800')
      .max(new Date().getFullYear(), `First release year cannot be in the future`)
      .optional()
      .nullable(),
    no_of_albums_released: z
      .number()
      .int()
      .min(0, 'Number of albums must be 0 or greater')
      .optional()
      .nullable()
      .default(0),
  }),
});


export const updateArtistSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid artist ID'),
  }),
  body: z.object({
    name: z.union([z.string().min(1), z.literal('')]).optional(),
    dob: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')]).optional().nullable(),
    gender: z.union([artistGenderEnum, z.literal('')]).optional().nullable(),
    address: z.string().optional().nullable(),
    first_release_year: z
      .number()
      .int()
      .min(1800, 'First release year must be at least 1800')
      .max(new Date().getFullYear(), `First release year cannot be in the future`)
      .optional()
      .nullable(),
    no_of_albums_released: z
      .number()
      .int()
      .min(0, 'Number of albums must be 0 or greater')
      .optional()
      .nullable(),
  }),
});

export const deleteArtistSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid artist ID'),
  }),
});

export const getArtistByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid artist ID'),
  }),
});

export const listArtistsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
  }),
});

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type DeleteArtistInput = z.infer<typeof deleteArtistSchema>;
export type GetArtistByIdInput = z.infer<typeof getArtistByIdSchema>;
export type ListArtistsInput = z.infer<typeof listArtistsSchema>;
