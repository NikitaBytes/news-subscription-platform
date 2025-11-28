// CORS Plugin

import type { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { env } from '../config/env';

export default async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // Explicitly include common custom headers and case-variations
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Fingerprint',
      'x-fingerprint',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    // Expose content-related headers to the browser
    exposedHeaders: ['Content-Length', 'Content-Type', 'X-Request-Id'],
  });
}
