// =====================================================
// COMMON API & PAGINATION TYPES
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  requestId?: string;
  errors?: Record<string, string> | null;
  stack?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationQueryParams {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "1" | "-1";
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedUser {
  _id: string | any;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: any;
  status: string;
  lastLogin?: Date | null;
  permissions?: string[];
  comparePassword?: (password: string) => Promise<boolean>;
}
