// Middleware for JWT token verification

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    
    // Additional check: is the user active
    if (request.user?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: { isActive: true },
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Account is deactivated. Please contact the administrator.' 
        });
      }
    }
  } catch (error) {
    reply.status(401).send({ success: false, error: 'Authorization required' });
  }
}
