// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  EDITOR: 'ROLE_EDITOR',
  SUBSCRIBER: 'ROLE_SUBSCRIBER',
} as const;
