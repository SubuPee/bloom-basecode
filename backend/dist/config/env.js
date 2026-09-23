"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// =====================================================
// DYNAMIC ENVIRONMENT CONFIGURATION & VALIDATION (Fail-Fast)
// =====================================================
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missingVars.join(", ")}`);
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
}
exports.env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000", 10),
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "fallback_development_secret_do_not_use_in_production",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    API_URL: process.env.API_URL || "http://localhost:5000",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV !== "production",
});
exports.default = exports.env;
//# sourceMappingURL=env.js.map