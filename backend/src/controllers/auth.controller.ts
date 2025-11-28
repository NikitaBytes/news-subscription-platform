// Authentication controller

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { registerUser, loginUser } from '../services/auth.service';
import { logUserAction } from '../services/logging.service';
import { ACTION_TYPES } from '../config/constants';
import type { JwtPayload } from '../types';
import { generateAccessToken } from '../utils/jwt';
import { createRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../services/refresh-token.service';
import { env } from '../config/env';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = registerSchema.parse(request.body);
    const user = await registerUser(data);

    await logUserAction({
      user: { userId: user.id, username: user.username, roles: [] },
      actionType: ACTION_TYPES.REGISTER,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.status(201).send({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        isActive: user.isActive,
      },
      message: 'Registration successful',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'Registration error',
    });
  }
}

export async function login(
  request: FastifyRequest<{ Body: { email: string; password: string; fingerprint: string } }>, 
  reply: FastifyReply, 
  fastify: FastifyInstance
) {
  try {
    const { email, password, fingerprint } = request.body;
    
    if (!fingerprint) {
      return reply.status(400).send({
        success: false,
        error: 'Fingerprint required',
      });
    }

    const data = loginSchema.parse({ email, password });
    const { user, roles } = await loginUser(data);

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      roles,
    };

    // Generate Access Token (15 minutes)
    const accessToken = generateAccessToken(fastify, payload);

    // Generate Refresh Token (7 days) with fingerprint from client
    const { token: refreshToken, expiresAt } = await createRefreshToken({
      userId: user.id,
      jwtPayload: payload,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      existingFingerprint: fingerprint, // Use fingerprint from client
    });

    // Save Refresh Token in httpOnly cookie
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    });

    await logUserAction({
      user: payload,
      actionType: ACTION_TYPES.LOGIN,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          roles,
        },
        accessToken, // Short-lived token (15 min)
        fingerprint, // Return the same fingerprint for saving on client
      },
      message: 'Login successful',
    });
  } catch (error: any) {
    // Logging failed login attempt
    await logUserAction({
      actionType: ACTION_TYPES.LOGIN,
      actionDetails: `Failed attempt: ${error.message}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.status(401).send({
      success: false,
      error: error.message || 'Login error',
    });
  }
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const refreshToken = request.cookies.refreshToken;
    
    if (refreshToken) {
      // Remove Refresh Token from DB
      await revokeRefreshToken(refreshToken);
    }

    // Remove cookie
    reply.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.LOGOUT,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    reply.status(500).send({
      success: false,
      error: error.message || 'Logout error',
    });
  }
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
    success: true,
    data: request.user,
  });
}

/**
 * Updates Access and Refresh tokens (Token Rotation)
 * OWASP: Automatic token renewal
 */
export async function refresh(
  request: FastifyRequest<{ Body: { fingerprint: string } }>,
  reply: FastifyReply,
  fastify: FastifyInstance
) {
  try {
    const oldRefreshToken = request.cookies.refreshToken;
    const { fingerprint } = request.body;

    if (!oldRefreshToken) {
      return reply.status(401).send({
        success: false,
        error: 'Refresh token not found',
      });
    }

    if (!fingerprint) {
      return reply.status(401).send({
        success: false,
        error: 'Fingerprint required',
      });
    }

    // Token rotation (removes old, creates new)
    const { token: newRefreshToken, fingerprint: newFingerprint, expiresAt } = 
      await rotateRefreshToken(
        oldRefreshToken,
        fingerprint,
        request.ip,
        request.headers['user-agent']
      );

    // Get user data from new token
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(newRefreshToken);

    // Remove system fields from payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...cleanPayload } = payload as any;

    // Generate new Access Token
    const newAccessToken = generateAccessToken(fastify, cleanPayload);

    // Update cookie with new Refresh Token
    reply.setCookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: expiresAt,
    });

    await logUserAction({
      user: payload,
      actionType: 'TOKEN_REFRESH',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      data: {
        accessToken: newAccessToken,
        fingerprint: newFingerprint, // Return the same fingerprint
      },
      message: 'Tokens refreshed',
    });
  } catch (error: any) {
    // Remove cookie on error
    reply.clearCookie('refreshToken');

    reply.status(401).send({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
}
