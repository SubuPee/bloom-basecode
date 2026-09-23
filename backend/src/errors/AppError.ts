import { HTTP_STATUS, HttpStatusCode } from "../constants/httpStatusCodes";

// =====================================================
// BASE OPERATIONAL APPLICATION ERROR (Liskov Substitution Principle)
// =====================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: Record<string, string> | null;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors: Record<string, string> | null = null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", errors: Record<string, string> | null = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied: insufficient permissions") {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", errors: Record<string, string> = {}) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export default AppError;
