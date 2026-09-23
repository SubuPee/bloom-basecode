import env from "../config/env";

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

export const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const formatLog = (level: string, message: string, meta: Record<string, any> = {}): string => {
  const timestamp = new Date().toISOString();
  const cleanMeta = sanitizeLogData(meta);

  if (env.isProduction) {
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

export interface Logger {
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  error: (message: string, meta?: Record<string, any>) => void;
  debug: (message: string, meta?: Record<string, any>) => void;
}

export const logger: Logger = {
  info: (message, meta = {}) => console.log(formatLog("info", message, meta)),
  warn: (message, meta = {}) => console.warn(formatLog("warn", message, meta)),
  error: (message, meta = {}) => console.error(formatLog("error", message, meta)),
  debug: (message, meta = {}) => {
    if (!env.isProduction) {
      console.debug(formatLog("debug", message, meta));
    }
  },
};

export default logger;
