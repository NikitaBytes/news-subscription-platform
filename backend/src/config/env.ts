// Environment variables configuration (NIST: secure configuration)
// Validation via Zod

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'), // Access Token: 15 minutes
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'), // Refresh Token: 7 days
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().url(),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  COOKIE_SECRET: z.string().min(32), // For signing cookies
});

export const env = envSchema.parse(process.env);
