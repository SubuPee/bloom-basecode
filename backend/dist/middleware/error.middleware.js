"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = __importDefault(require("../config/env"));
// =====================================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE (Single Catch Pipeline)
// =====================================================
const errorMiddleware = (err, req, res, _next) => {
    let statusCode = err.statusCode || httpStatusCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal server error";
    let errors = err.errors || null;
    // Handle Mongoose Validation Error
    if (err.name === "ValidationError" && err.errors) {
        statusCode = httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST;
        message = "Database validation failed";
        errors = Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {});
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = httpStatusCodes_1.HTTP_STATUS.BAD_REQUEST;
        message = `Invalid format for field: ${err.path}`;
    }
    // Handle MongoDB Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = httpStatusCodes_1.HTTP_STATUS.CONFLICT;
        const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
        message = `Duplicate value entered for ${duplicateField}. Must be unique.`;
    }
    // Handle JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED;
        message = "Invalid authentication token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = httpStatusCodes_1.HTTP_STATUS.UNAUTHORIZED;
        message = "Authentication token has expired";
    }
    // Log error with correlation ID
    logger_1.default.error(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`, {
        requestId: req.id,
        statusCode,
        stack: env_1.default.isDevelopment ? err.stack : undefined,
    });
    const responsePayload = {
        success: false,
        message,
        requestId: req.id,
    };
    if (errors) {
        responsePayload.errors = errors;
    }
    if (env_1.default.isDevelopment && statusCode === httpStatusCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        responsePayload.stack = err.stack;
    }
    return res.status(statusCode).json(responsePayload);
};
exports.errorMiddleware = errorMiddleware;
exports.default = exports.errorMiddleware;
//# sourceMappingURL=error.middleware.js.map