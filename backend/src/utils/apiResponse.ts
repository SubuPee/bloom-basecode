import { Response } from "express";
import { HTTP_STATUS, HttpStatusCode } from "../constants/httpStatusCodes";
import { ApiResponse, PaginationMeta } from "../types/common.types";

// =====================================================
// STANDARDIZED API RESPONSE ENVELOPE (Consistent Contract)
// =====================================================

export const sendSuccess = <T = any>(
  res: Response,
  data: T | null = null,
  message: string = "Success",
  statusCode: HttpStatusCode = HTTP_STATUS.OK
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== null && data !== undefined ? { data } : {}),
  };
  return res.status(statusCode).json(payload);
};

export const sendCreated = <T = any>(
  res: Response,
  data: T | null = null,
  message: string = "Created successfully"
): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendPaginated = <T = any>(
  res: Response,
  items: T[] = [],
  pagination: Partial<PaginationMeta> = {},
  message: string = "Records retrieved successfully"
): Response => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        total: pagination.total || 0,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: pagination.totalPages || 1,
      },
    },
  });
};

export const sendError = (
  res: Response,
  message: string = "Error",
  statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors: Record<string, string> | null = null
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
