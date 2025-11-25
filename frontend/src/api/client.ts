// Axios instance with interceptors for handling authentication

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback для обработки 401 ошибок (устанавливается в AuthContext)
let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

// Request interceptor - добавление JWT токена
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Вызываем callback для навигации без перезагрузки страницы
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);
