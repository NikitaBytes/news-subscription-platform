// JWT Plugin (authentication)

import type { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env';

export default async function jwtPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });
}
