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

// Callback для обработки других HTTP ошибок (403, 404, 500+)
let errorNavigationCallback: ((status: number) => void) | null = null;

export const setErrorNavigationCallback = (callback: (status: number) => void) => {
  errorNavigationCallback = callback;
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
    const status = error.response?.status;
    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Вызываем callback для навигации без перезагрузки страницы
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    } else if (status && errorNavigationCallback) {
      // Обрабатываем 403, 404, 500+ статусы
      if (status === 403 || status === 404 || status >= 500) {
        errorNavigationCallback(status);
      }
    }
    
    return Promise.reject(error);
  }
);
