// Routes for categories

import type { FastifyInstance } from 'fastify';
import * as categoriesController from '../controllers/categories.controller';

export default async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get('/', categoriesController.getAll);
}
