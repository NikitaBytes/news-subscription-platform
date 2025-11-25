// Zod schemas for authentication validation (OWASP: strict validation)

import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH } from '../config/constants';

export const registerSchema = z.object({
  username: z.string().min(USERNAME_MIN_LENGTH).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(100),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
