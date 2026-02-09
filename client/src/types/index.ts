export interface User {
  id: string;
  email: string;
}

export interface ResponseData {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: any;
  };
  savedToHistory?: boolean;
  duration?: number;
}

export interface HistoryItem {
  _id: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  request: {
    headers: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: any;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Stats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  methodBreakdown: Record<string, number>;
  statusBreakdown: Record<number, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
