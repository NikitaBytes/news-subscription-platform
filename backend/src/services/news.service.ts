// News service

import { prisma } from '../db/prisma';
import type { CreateNewsInput, UpdateNewsInput } from '../schemas/news.schema';

export async function createNews(authorId: number, data: CreateNewsInput) {
  return prisma.news.create({
    data: {
      ...data,
      authorId,
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}

export async function updateNews(newsId: number, data: UpdateNewsInput) {
  return prisma.news.update({
    where: { id: newsId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}

export async function deleteNews(newsId: number) {
  return prisma.news.delete({
    where: { id: newsId },
  });
}

export async function getNews(newsId: number) {
  return prisma.news.findUnique({
    where: { id: newsId },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}

export async function getAllNews(categoryId?: number) {
  return prisma.news.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: {
      category: true,
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
