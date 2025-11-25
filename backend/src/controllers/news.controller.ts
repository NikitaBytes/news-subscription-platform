// News controller

import type { FastifyRequest, FastifyReply } from 'fastify';
import { createNewsSchema, updateNewsSchema } from '../schemas/news.schema';
import * as newsService from '../services/news.service';
import { logUserAction } from '../services/logging.service';
import { ACTION_TYPES } from '../config/constants';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = createNewsSchema.parse(request.body);
    const news = await newsService.createNews(request.user!.userId, data);

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.CREATE_NEWS,
      actionDetails: `News created ID: ${news.id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.status(201).send({
      success: true,
      data: news,
      message: 'News created',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'News creation error',
    });
  }
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const data = updateNewsSchema.parse(request.body);
    const news = await newsService.updateNews(Number(id), data);

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.UPDATE_NEWS,
      actionDetails: `News updated ID: ${id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      data: news,
      message: 'News updated',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'News update error',
    });
  }
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    await newsService.deleteNews(Number(id));

    await logUserAction({
      user: request.user,
      actionType: ACTION_TYPES.DELETE_NEWS,
      actionDetails: `News deleted ID: ${id}`,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    reply.send({
      success: true,
      message: 'News deleted',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'News deletion error',
    });
  }
}

export async function getOne(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const news = await newsService.getNews(Number(id));

    if (!news) {
      return reply.status(404).send({
        success: false,
        error: 'News not found',
      });
    }

    reply.send({
      success: true,
      data: news,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function getAll(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { categoryId } = request.query as { categoryId?: string };
    const news = await newsService.getAllNews(
      categoryId ? Number(categoryId) : undefined
    );

    reply.send({
      success: true,
      data: news,
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
