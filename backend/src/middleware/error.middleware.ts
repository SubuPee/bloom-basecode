import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatusCodes";
import logger from "../utils/logger";
import env from "../config/env";

// =====================================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE (Single Catch Pipeline)
// =====================================================

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode: number = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = err.message || "Internal server error";
  let errors: any = err.errors || null;

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Database validation failed";
    errors = Object.keys(err.errors).reduce((acc: Record<string, string>, key: string) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${duplicateField}. Must be unique.`;
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Authentication token has expired";
  }

  // Log error with correlation ID
  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`, {
    requestId: req.id,
    statusCode,
    stack: env.isDevelopment ? err.stack : undefined,
  });

  const responsePayload: {
    success: boolean;
    message: string;
    requestId?: string;
    errors?: any;
    stack?: string;
  } = {
    success: false,
    message,
    requestId: req.id,
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  if (env.isDevelopment && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

export default errorMiddleware;
