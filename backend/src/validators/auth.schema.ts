import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255).transform(val => val.toLowerCase()),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
});

export const loginSchema = z.object({
  email: z.string().email().transform(val => val.toLowerCase()),
  password: z.string()
});

export const refreshSchema = z.object({
  refreshToken: z.string()
});
