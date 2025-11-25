// Subscriptions controller

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';
import { logUserAction } from '../services/logging.service';
import { ACTION_TYPES } from '../config/constants';

export async function subscribe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { categoryId } = request.body as { categoryId: number };
    const userId = request.user!.userId;

    const existing = await prisma.subscription.findUnique({
      where: {
        userId_categoryId: { userId, categoryId },
      },
    });

    if (existing) {
      return reply.status(400).send({
        success: false,
        error: 'You are already subscribed to this category',
      });
    }

    const subscription = await prisma.subscription.create({
      data: { userId, categoryId },
      include: { category: true },
    });

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.SUBSCRIBE_CATEGORY,
      actionDetails: `Subscribed to category ID: ${categoryId}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.status(201).send({
      success: true,
      data: subscription,
      message: 'Subscription successful',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function unsubscribe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { categoryId } = request.params as { categoryId: string };
    const userId = request.user!.userId;

    await prisma.subscription.delete({
      where: {
        userId_categoryId: { userId, categoryId: Number(categoryId) },
      },
    });

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.UNSUBSCRIBE_CATEGORY,
      actionDetails: `Unsubscribed from category ID: ${categoryId}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'Unsubscribe error',
    });
  }
}

export async function getMy(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user!.userId;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        category: {
          include: {
            _count: { select: { news: true } },
          },
        },
      },
    });

    reply.send({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
