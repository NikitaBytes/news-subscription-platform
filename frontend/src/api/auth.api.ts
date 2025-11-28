// API for authentication

import { apiClient } from './client';
import type { AuthResponse, ApiResponse, User } from '../types';
import { getOrCreateFingerprint } from '../utils/fingerprint';

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
    const fingerprint = await getOrCreateFingerprint();
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
      fingerprint,
    });
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post<ApiResponse>('/auth/logout');
    return data;
  },

  refresh: async () => {
    const fingerprint = await getOrCreateFingerprint();
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      fingerprint,
    });
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse<User & { roles: string[] }>>('/auth/me');
    return data;
  },
};
