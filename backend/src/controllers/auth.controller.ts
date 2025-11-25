// Authentication controller

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { registerUser, loginUser } from '../services/auth.service';
import { logUserAction } from '../services/logging.service';
import { ACTION_TYPES } from '../config/constants';
import type { JwtPayload } from '../types';

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
  request: FastifyRequest, 
  reply: FastifyReply, 
  fastify: FastifyInstance
) {
  try {
    const data = loginSchema.parse(request.body);
    const { user, roles } = await loginUser(data);

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      roles,
    };

    const token = fastify.jwt.sign(payload);

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
        token,
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
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  reply.send({
    success: true,
    data: request.user,
  });
}
