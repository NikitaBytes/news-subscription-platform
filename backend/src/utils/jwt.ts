// Utility for working with JWT tokens

import type { FastifyInstance } from 'fastify';
import type { JwtPayload } from '../types';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

/**
 * Generates Access Token (short-lived, 15 minutes)
 */
export function generateAccessToken(fastify: FastifyInstance, payload: JwtPayload): string {
  return fastify.jwt.sign(payload, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Generates Refresh Token (long-lived, 7 days)
 * Uses a separate secret for additional security
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verifies Access Token
 */
export function verifyAccessToken(fastify: FastifyInstance, token: string): JwtPayload {
  return fastify.jwt.verify(token);
}

/**
 * Verifies Refresh Token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * Decodes token without verification (to get expiresAt)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

// Deprecated - for backward compatibility
export function generateToken(fastify: FastifyInstance, payload: JwtPayload): string {
  return generateAccessToken(fastify, payload);
}

export function verifyToken(fastify: FastifyInstance, token: string): JwtPayload {
  return verifyAccessToken(fastify, token);
}
