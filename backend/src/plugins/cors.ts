// CORS Plugin

import type { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { env } from '../config/env';

export default async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });
}
