// Routes for logs (Admin only)

import type { FastifyInstance } from 'fastify';
import * as logsController from '../controllers/logs.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

export default async function logsRoutes(fastify: FastifyInstance) {
  // Логи действий пользователей
  fastify.get(
    '/user-actions',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getUserActionLogs
  );

  // Типы действий пользователей (для фильтров)
  fastify.get(
    '/user-actions/types',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getActionTypes
  );

  // HTTP ошибки
  fastify.get(
    '/http-errors',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getHttpErrorLogs
  );

  // Статистика HTTP ошибок
  fastify.get(
    '/http-errors/stats',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getHttpErrorStats
  );

  // Ошибки приложения
  fastify.get(
    '/app-errors',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getAppErrorLogs
  );

  // Типы ошибок приложения (для фильтров)
  fastify.get(
    '/app-errors/types',
    {
      onRequest: [authenticateToken, requireRole(ROLES.ADMIN)],
    },
    logsController.getErrorTypes
  );
}
