"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
// =====================================================
// BASE OPERATIONAL APPLICATION ERROR (Liskov Substitution Principle)
// =====================================================
class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode = httpStatusCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = "Bad request", errors = null) {
        super(message, httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST, errors);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Access denied: insufficient permissions") {
        super(message, httpStatusCodes_1.HTTP_STATUS.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, httpStatusCodes_1.HTTP_STATUS.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, httpStatusCodes_1.HTTP_STATUS.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(message = "Validation failed", errors = {}) {
        super(message, httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST, errors);
    }
}
exports.ValidationError = ValidationError;
exports.default = AppError;
//# sourceMappingURL=AppError.js.map