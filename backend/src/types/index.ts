// TypeScript types for the application

import { User } from '@prisma/client';

// JWT payload
export interface JwtPayload {
  userId: number;
  username: string;
  roles: string[];
}

// Fastify declaration for JWT
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user?: JwtPayload;
  }
}

// FastifyRequest extension for user
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

// User without password
export type SafeUser = Omit<User, 'passwordHash'>;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
}
