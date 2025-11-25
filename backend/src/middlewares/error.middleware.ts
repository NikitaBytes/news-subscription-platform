// Middleware for error handling and HTTP error logging

import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { logHttpError, logAppError } from '../services/logging.service';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Log HTTP errors (≥400)
  if (statusCode >= 400) {
    await logHttpError(
      statusCode,
      request.method,
      request.url,
      request.ip,
      message
    );
  }

  // Log critical application errors (500)
  if (statusCode >= 500) {
    await logAppError(error.name || 'ServerError', message, request.url);
  }

  reply.status(statusCode).send({
    success: false,
    error: message,
  });
}
