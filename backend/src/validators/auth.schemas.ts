import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string().min(4, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createAdminSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
