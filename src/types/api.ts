import type { User } from "./user";

export type SortOrder = "ASC" | "DESC";

export interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: SortOrder;
  paginate?: boolean;
}

export interface ApiResponse<T = unknown> {
  meta: { success: boolean; message: string; statusCode: number; errorCode?: string };
  data: T;
  pagination?: PaginationInfo;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}
