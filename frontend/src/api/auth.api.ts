// API for authentication

import { apiClient } from './client';
import type { AuthResponse, ApiResponse, User } from '../types';

export const authApi = {
  register: async (username: string, email: string, password: string) => {
    const { data } = await apiClient.post<ApiResponse<User>>('/auth/register', {
      username,
      email,
      password,
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post<ApiResponse>('/auth/logout');
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse>('/auth/me');
    return data;
  },
};
