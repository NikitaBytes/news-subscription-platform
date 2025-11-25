// Routes for logs (Admin only)

import type { FastifyInstance } from 'fastify';
import * as logsController from '../controllers/logs.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

export default async function logsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/user-actions',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getUserActionLogs
  );

  fastify.get(
    '/http-errors',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getHttpErrorLogs
  );

  fastify.get(
    '/app-errors',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getAppErrorLogs
  );
}
