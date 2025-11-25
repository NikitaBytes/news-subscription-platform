// TypeScript types for Frontend

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface News {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string | null;
  category: Category;
  author: {
    id: number;
    username: string;
    email: string;
  };
}

export interface Subscription {
  id: number;
  userId: number;
  categoryId: number;
  createdAt: string;
  category: Category & {
    _count: { news: number };
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User & { roles: string[] };
    token: string;
  };
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserActionLog {
  id: number;
  userId: number | null;
  actionType: string;
  actionDetails: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface HttpErrorLog {
  id: number;
  statusCode: number;
  method: string;
  url: string;
  ipAddress: string | null;
  message: string | null;
  createdAt: string;
}

export interface AppErrorLog {
  id: number;
  errorType: string;
  message: string;
  url: string | null;
  createdAt: string;
}
