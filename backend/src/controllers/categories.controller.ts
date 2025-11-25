// Categories controller

import type { FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

export async function getAll(_request: unknown, reply: FastifyReply) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { news: true, subscriptions: true },
        },
      },
    });

    reply.send({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
