// Routes for user management (Admin only)

import type { FastifyInstance } from 'fastify';
import * as usersController from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    usersController.getAll
  );

  fastify.put(
    '/:id/role',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    usersController.updateRole
  );

  fastify.delete(
    '/:id/role/:roleId',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    usersController.removeRole
  );

  fastify.put(
    '/:id/status',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    usersController.updateStatus
  );
}
