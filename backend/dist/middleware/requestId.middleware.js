"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = void 0;
const crypto_1 = __importDefault(require("crypto"));
// =====================================================
// REQUEST ID & CORRELATION MIDDLEWARE (Observability)
// =====================================================
const requestIdMiddleware = (req, res, next) => {
    const correlationId = req.headers["x-request-id"] || crypto_1.default.randomUUID();
    req.id = correlationId;
    res.setHeader("X-Request-ID", correlationId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
exports.default = exports.requestIdMiddleware;
//# sourceMappingURL=requestId.middleware.js.map