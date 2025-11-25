// Routes for news

import type { FastifyInstance } from 'fastify';
import * as newsController from '../controllers/news.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

export default async function newsRoutes(fastify: FastifyInstance) {
  // Public read
  fastify.get('/', newsController.getAll);
  fastify.get('/:id', newsController.getOne);

  // Create/edit/delete - only Editor or Admin
  fastify.post(
    '/',
    {
      onRequest: [authenticateToken, requireRole(ROLES.EDITOR, ROLES.ADMIN)],
    },
    newsController.create
  );

  fastify.put(
    '/:id',
    {
      onRequest: [authenticateToken, requireRole(ROLES.EDITOR, ROLES.ADMIN)],
    },
    newsController.update
  );

  fastify.delete(
    '/:id',
    {
      onRequest: [authenticateToken, requireRole(ROLES.EDITOR, ROLES.ADMIN)],
    },
    newsController.remove
  );
}
