// Main server file

// Load environment variables (must be first!)
import 'dotenv/config';

import Fastify from 'fastify';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

// Plugins
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import httpErrorLogger from './plugins/httpErrorLogger';
import cookiePlugin from './plugins/cookie';

// Routes
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import categoriesRoutes from './routes/categories.routes';
import subscriptionsRoutes from './routes/subscriptions.routes';
import usersRoutes from './routes/users.routes';
import logsRoutes from './routes/logs.routes';
import rolesRoutes from './routes/roles.routes';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register security plugins (OWASP/NIST)
// CORS must be first!
fastify.register(fastifyCors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // Allow custom fingerprint header and common headers (case variations)
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Fingerprint',
    'x-fingerprint',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Request-Id'],
});

fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

// Register Cookie plugin for secure Refresh Token storage
fastify.register(cookiePlugin);

// JWT registration directly (globally)
fastify.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: env.JWT_EXPIRES_IN,
  },
});

// Register HTTP error logger plugin
fastify.register(httpErrorLogger);

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(newsRoutes, { prefix: '/api/news' });
fastify.register(categoriesRoutes, { prefix: '/api/categories' });
fastify.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
fastify.register(usersRoutes, { prefix: '/api/users' });
fastify.register(logsRoutes, { prefix: '/api/logs' });
fastify.register(rolesRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler(errorHandler);

// Start server
const start = async () => {
  try {
    // Wait for all plugins to load
    await fastify.ready();
    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
