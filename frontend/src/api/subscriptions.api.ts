// API for managing subscriptions

import { apiClient } from './client';
import type { Subscription, ApiResponse } from '../types';

export const subscriptionsApi = {
  getMy: async () => {
    const { data } = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/my');
    return data;
  },

  subscribe: async (categoryId: number) => {
    const { data } = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', {
      categoryId,
    });
    return data;
  },

  unsubscribe: async (categoryId: number) => {
    const { data } = await apiClient.delete<ApiResponse>(`/subscriptions/${categoryId}`);
    return data;
  },
};
