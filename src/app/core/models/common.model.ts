export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CountResponse {
  count: number;
}

export interface RevenueResponse {
  total: number;
  debut?: string;
  fin?: string;
}

export interface ActionResponse {
  message: string;
  id?: string;
  warning?: string;
  [key: string]: unknown;
}