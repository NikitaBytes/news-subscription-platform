// Roles controller

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

/**
 * Get all roles
 * Public endpoint - needed for role selection in UI
 */
export async function getAllRoles(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    reply.send({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    reply.status(500).send({
      success: false,
      error: error.message || 'Failed to fetch roles',
    });
  }
}
