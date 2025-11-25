// Zod schemas for user validation

import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  roleId: z.number().int().positive(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
