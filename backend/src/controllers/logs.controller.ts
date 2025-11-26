// Logs controller (Admin only)

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

interface LogsQueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UserActionLogsQuery extends LogsQueryParams {
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface HttpErrorLogsQuery extends LogsQueryParams {
  statusCode?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface AppErrorLogsQuery extends LogsQueryParams {
  errorType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getUserActionLogs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { 
      page = '1', 
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      actionType,
      startDate,
      endDate,
      search,
    } = request.query as UserActionLogsQuery;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Построение фильтров
    const where: any = {};

    if (userId) {
      where.userId = Number(userId);
    }

    if (actionType) {
      where.actionType = actionType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { actionDetails: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Получение данных с пагинацией
    const [logs, total] = await Promise.all([
      prisma.userActionLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.userActionLog.count({ where }),
    ]);

    reply.send({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
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
    const { 
      page = '1', 
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      statusCode,
      method,
      startDate,
      endDate,
      search,
    } = request.query as HttpErrorLogsQuery;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Построение фильтров
    const where: any = {};

    if (statusCode) {
      where.statusCode = Number(statusCode);
    }

    if (method) {
      where.method = method.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { url: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Получение данных с пагинацией
    const [logs, total] = await Promise.all([
      prisma.httpErrorLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.httpErrorLog.count({ where }),
    ]);

    reply.send({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
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
    const { 
      page = '1', 
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      errorType,
      startDate,
      endDate,
      search,
    } = request.query as AppErrorLogsQuery;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Построение фильтров
    const where: any = {};

    if (errorType) {
      where.errorType = errorType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Получение данных с пагинацией
    const [logs, total] = await Promise.all([
      prisma.appErrorLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.appErrorLog.count({ where }),
    ]);

    reply.send({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

// Получение списка уникальных типов действий пользователей
export async function getActionTypes(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const actionTypes = await prisma.userActionLog.findMany({
      select: { actionType: true },
      distinct: ['actionType'],
      orderBy: { actionType: 'asc' },
    });

    reply.send({
      success: true,
      data: actionTypes.map(log => log.actionType),
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

// Получение списка уникальных типов ошибок приложения
export async function getErrorTypes(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const errorTypes = await prisma.appErrorLog.findMany({
      select: { errorType: true },
      distinct: ['errorType'],
      orderBy: { errorType: 'asc' },
    });

    reply.send({
      success: true,
      data: errorTypes.map(log => log.errorType),
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}

// Получение статистики HTTP ошибок
export async function getHttpErrorStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const stats = await prisma.httpErrorLog.groupBy({
      by: ['statusCode'],
      where,
      _count: { statusCode: true },
      orderBy: { _count: { statusCode: 'desc' } },
    });

    reply.send({
      success: true,
      data: stats.map(stat => ({
        statusCode: stat.statusCode,
        count: stat._count.statusCode,
      })),
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message,
    });
  }
}
