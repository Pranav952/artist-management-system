import { z } from 'zod';

export const userGenderEnum = z.enum(['m', 'f', 'o']);

export const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().nullable(),
    dob: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), z.literal('')]).optional().nullable(),
    gender: z.union([userGenderEnum, z.literal('')]).optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
