// Cookie Plugin for secure storage of Refresh Token
// OWASP: httpOnly, secure, sameSite

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import { env } from '../config/env';

async function cookiePlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
  });
}

export default fp(cookiePlugin);
