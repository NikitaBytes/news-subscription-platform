// Plugin for logging HTTP errors

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { logHttpError } from '../services/logging.service';

async function httpErrorLoggerPlugin(fastify: FastifyInstance) {
  fastify.addHook('onResponse', async (request, reply) => {
    const statusCode = reply.statusCode;

    // Log HTTP errors (status >= 400)
    if (statusCode >= 400) {
      try {
        await logHttpError(
          statusCode,
          request.method,
          request.url,
          request.ip,
          `${request.method} ${request.url} - ${statusCode}`
        );
      } catch (err: any) {
        fastify.log.error({ err }, 'Failed to log HTTP error');
      }
    }
  });
}

export default fp(httpErrorLoggerPlugin, {
  name: 'http-error-logger',
});
