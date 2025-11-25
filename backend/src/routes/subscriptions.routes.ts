// Routes for subscriptions

import type { FastifyInstance } from 'fastify';
import * as subscriptionsController from '../controllers/subscriptions.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export default async function subscriptionsRoutes(fastify: FastifyInstance) {
  fastify.get('/my', { onRequest: [authenticateToken] }, subscriptionsController.getMy);
  fastify.post('/', { onRequest: [authenticateToken] }, subscriptionsController.subscribe);
  fastify.delete(
    '/:categoryId',
    { onRequest: [authenticateToken] },
    subscriptionsController.unsubscribe
  );
}
