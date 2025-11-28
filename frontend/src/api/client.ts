/**
 * Secure Axios Client with Token Management
 * 
 * Features:
 * - Access token stored in memory (module-level variable, NOT localStorage)
 * - Automatic 401 handling with refresh token rotation
 * - Request/response interceptors for secure authentication
 * - Fingerprint-based token validation
 * 
 * Security:
 * - Access tokens never touch localStorage (XSS protection)
 * - Refresh tokens stored in httpOnly cookies (server-managed)
 * - Automatic token refresh on 401 errors
 * - Prevention of concurrent refresh requests
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getOrCreateFingerprint } from '../utils/fingerprint';

// Access token stored in memory (module-level variable)
// This is cleared when the page is refreshed, requiring a new login or token refresh
let accessToken: string | null = null;

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;

// Queue of failed requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process the queue of failed requests after token refresh
 */
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Set access token in memory
 */
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/**
 * Get current access token from memory
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * Clear access token from memory
 */
export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Axios instance with secure configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // CRITICAL: Required to send/receive httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds access token to Authorization header
 * Note: Fingerprint is sent in request body for /auth/login and /auth/refresh
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add access token if available
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // DO NOT add fingerprint header - it's sent in request body for auth endpoints
    // and not needed for other endpoints (they use Authorization header)

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles 401 errors by attempting to refresh the access token
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark request as retried to prevent infinite loops
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the access token
      const fingerprint = await getOrCreateFingerprint();
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { fingerprint },
        { withCredentials: true }
      );

      if (response.data.success && response.data.data?.accessToken) {
        const newAccessToken = response.data.data.accessToken;
        
        // Update access token in memory
        setAccessToken(newAccessToken);
        
        // Process queued requests with new token
        processQueue(null, newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } else {
        // Refresh failed - clear token and reject
        clearAccessToken();
        processQueue(new Error('Token refresh failed'), null);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      // Refresh failed - clear token and reject all queued requests
      clearAccessToken();
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
