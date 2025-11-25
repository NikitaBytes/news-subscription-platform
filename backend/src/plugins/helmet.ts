// Helmet Plugin (OWASP security headers)

import type { FastifyInstance } from 'fastify';
import fastifyHelmet from '@fastify/helmet';

export default async function helmetPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });
}
