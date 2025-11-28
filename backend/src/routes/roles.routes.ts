// Routes for roles

import type { FastifyInstance } from 'fastify';
import * as rolesController from '../controllers/roles.controller';

export default async function rolesRoutes(fastify: FastifyInstance) {
  // Public endpoint - needed for UI to display role options
  fastify.get('/roles', rolesController.getAllRoles);
}
