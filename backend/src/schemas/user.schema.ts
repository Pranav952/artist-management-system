import { z } from 'zod';

export const userGenderEnum = z.enum(['male', 'female', 'other']);

export const createUserSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().nullable(),
    dob: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')]).optional().nullable(),
    gender: z.union([userGenderEnum, z.literal('')]).optional().nullable(),
    address: z.string().optional().nullable(),
    role: z.enum(['admin']).optional().nullable(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
  body: z.object({
    first_name: z.union([z.string().min(2, 'First name must be at least 2 characters'), z.literal('')]).optional(),
    last_name: z.union([z.string().min(2, 'Last name must be at least 2 characters'), z.literal('')]).optional(),
    email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
    phone: z.string().optional().nullable(),
    dob: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')]).optional().nullable(),
    gender: z.union([userGenderEnum, z.literal('')]).optional().nullable(),
    address: z.string().optional().nullable(),
    role: z.union([z.enum(['admin']), z.literal('')]).optional().nullable(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid user ID'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;
