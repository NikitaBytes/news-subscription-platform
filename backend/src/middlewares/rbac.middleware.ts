// Middleware for Role-Based Access Control (RBAC)

import type { FastifyRequest, FastifyReply } from 'fastify';

export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user) {
      return reply.status(401).send({ success: false, error: 'Authorization required' });
    }

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return reply.status(403).send({ success: false, error: 'Insufficient permissions' });
    }
  };
}
