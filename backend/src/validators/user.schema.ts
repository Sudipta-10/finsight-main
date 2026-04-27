import { z } from 'zod';
import { Role } from '../types';

export const createUserSchema = z.object({
  email: z.string().email().max(255).transform(val => val.toLowerCase()),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  role: z.enum([Role.VIEWER, Role.ANALYST, Role.ADMIN]),
});

export const updateUserSchema = z.object({
  role: z.enum([Role.VIEWER, Role.ANALYST, Role.ADMIN]).optional(),
  isActive: z.boolean().optional(),
});

export const updateMeSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/).optional(),
  avatar: z.string().optional()
});
