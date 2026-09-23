import rateLimit from "express-rate-limit";
import { HTTP_STATUS } from "../constants/httpStatusCodes";

// =====================================================
// RATE LIMITING MIDDLEWARE (Brute-force & Abuse Defense)
// =====================================================

// Strict rate limiter for authentication routes (login / token exchange)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per IP per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

// General rate limiter for standard API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Rate limit exceeded. Please slow down your requests.",
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

export default {
  authLimiter,
  apiLimiter,
};
