"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
// =====================================================
// RATE LIMITING MIDDLEWARE (Brute-force & Abuse Defense)
// =====================================================
// Strict rate limiter for authentication routes (login / token exchange)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Max 20 attempts per IP per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many login attempts from this IP. Please try again after 15 minutes.",
    },
    statusCode: httpStatusCodes_1.HTTP_STATUS.TOO_MANY_REQUESTS,
});
// General rate limiter for standard API routes
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Max 500 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Rate limit exceeded. Please slow down your requests.",
    },
    statusCode: httpStatusCodes_1.HTTP_STATUS.TOO_MANY_REQUESTS,
});
exports.default = {
    authLimiter: exports.authLimiter,
    apiLimiter: exports.apiLimiter,
};
//# sourceMappingURL=rateLimiter.middleware.js.map