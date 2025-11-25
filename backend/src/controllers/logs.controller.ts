// Logs controller (Admin only)

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

export async function getUserActionLogs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { limit = '100' } = request.query as { limit?: string };

    const logs = await prisma.userActionLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    reply.send({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function getHttpErrorLogs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { limit = '100' } = request.query as { limit?: string };

    const logs = await prisma.httpErrorLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    reply.send({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function getAppErrorLogs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { limit = '100' } = request.query as { limit?: string };

    const logs = await prisma.appErrorLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    reply.send({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
