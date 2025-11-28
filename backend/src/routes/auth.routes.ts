// Routes for authentication

import type { FastifyInstance } from 'fastify';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register);
  
  // Login with direct access to fastify.jwt
  fastify.post<{ Body: { email: string; password: string; fingerprint: string } }>('/login', async (request, reply) => {
    return authController.login(request, reply, fastify);
  });
  
  // Refresh tokens (public endpoint, checked via cookie + fingerprint)
  fastify.post<{ Body: { fingerprint: string } }>('/refresh', async (request, reply) => {
    return authController.refresh(request, reply, fastify);
  });
  
  fastify.post('/logout', { onRequest: [authenticateToken] }, authController.logout);
  fastify.get('/me', { onRequest: [authenticateToken] }, authController.getMe);
}
