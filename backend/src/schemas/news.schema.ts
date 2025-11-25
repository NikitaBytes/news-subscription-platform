// Zod schemas for news validation

import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  categoryId: z.number().int().positive(),
});

export const updateNewsSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  categoryId: z.number().int().positive().optional(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
