import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255).transform(val => val.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  role: z.enum(['VIEWER', 'ANALYST']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase()),
  password: z.string()
});

export const refreshSchema = z.object({
  refreshToken: z.string()
});
