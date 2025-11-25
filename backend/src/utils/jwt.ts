// Utility for working with JWT tokens

import type { FastifyInstance } from 'fastify';
import type { JwtPayload } from '../types';

export function generateToken(fastify: FastifyInstance, payload: JwtPayload): string {
  return fastify.jwt.sign(payload);
}

export function verifyToken(fastify: FastifyInstance, token: string): JwtPayload {
  return fastify.jwt.verify(token);
}
