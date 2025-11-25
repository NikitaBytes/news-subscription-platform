// API for managing news articles

import { apiClient } from './client';
import type { News, ApiResponse } from '../types';

export const newsApi = {
  getAll: async (categoryId?: number) => {
    const params = categoryId ? { categoryId } : {};
    const { data } = await apiClient.get<ApiResponse<News[]>>('/news', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<News>>(`/news/${id}`);
    return data;
  },

  create: async (newsData: { title: string; content: string; categoryId: number }) => {
    const { data } = await apiClient.post<ApiResponse<News>>('/news', newsData);
    return data;
  },

  update: async (id: number, newsData: Partial<{ title: string; content: string; categoryId: number }>) => {
    const { data } = await apiClient.put<ApiResponse<News>>(`/news/${id}`, newsData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse>(`/news/${id}`);
    return data;
  },
};
