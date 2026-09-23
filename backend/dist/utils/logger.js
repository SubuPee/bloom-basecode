"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.formatLog = exports.sanitizeLogData = void 0;
const env_1 = __importDefault(require("../config/env"));
// Sensitive field keys to automatically redact from logs
const SENSITIVE_KEYS = new Set([
    "password",
    "passwordhash",
    "token",
    "accesstoken",
    "refreshtoken",
    "authorization",
    "secret",
    "creditcard",
    "cvv",
]);
const sanitizeLogData = (data) => {
    if (!data || typeof data !== "object")
        return data;
    if (Array.isArray(data)) {
        return data.map(exports.sanitizeLogData);
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
            sanitized[key] = "[REDACTED]";
        }
        else if (typeof value === "object") {
            sanitized[key] = (0, exports.sanitizeLogData)(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};
exports.sanitizeLogData = sanitizeLogData;
const formatLog = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const cleanMeta = (0, exports.sanitizeLogData)(meta);
    if (env_1.default.isProduction) {
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...cleanMeta,
        });
    }
    const metaStr = Object.keys(cleanMeta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : "";
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix}: ${message}${metaStr}`;
};
exports.formatLog = formatLog;
exports.logger = {
    info: (message, meta = {}) => console.log((0, exports.formatLog)("info", message, meta)),
    warn: (message, meta = {}) => console.warn((0, exports.formatLog)("warn", message, meta)),
    error: (message, meta = {}) => console.error((0, exports.formatLog)("error", message, meta)),
    debug: (message, meta = {}) => {
        if (!env_1.default.isProduction) {
            console.debug((0, exports.formatLog)("debug", message, meta));
        }
    },
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map