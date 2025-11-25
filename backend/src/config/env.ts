// Конфигурация переменных окружения (NIST: защищенная конфигурация)
// Валидация через Zod

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().url(),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

export const env = envSchema.parse(process.env);
