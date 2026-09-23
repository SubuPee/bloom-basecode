"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = __importDefault(require("./config/env"));
const logger_1 = __importDefault(require("./utils/logger"));
const mongoose_1 = __importDefault(require("mongoose"));
const vendor_service_1 = require("./services/vendor.service");
let server;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, vendor_service_1.seedInitialVendorsIfEmpty)();
        server = app_1.default.listen(env_1.default.PORT, "0.0.0.0", () => {
            logger_1.default.info(`Bloom Ecommerce API running in [${env_1.default.NODE_ENV}] mode on port ${env_1.default.PORT}`);
            logger_1.default.info(`Swagger docs available at http://localhost:${env_1.default.PORT}/api-docs`);
            logger_1.default.info(`Health check available at http://localhost:${env_1.default.PORT}/api/health`);
        });
    }
    catch (error) {
        logger_1.default.error("Server startup failed: " + (error?.message || error), {
            error: error?.message,
            stack: error?.stack,
        });
        process.exit(1);
    }
};
// =====================================================
// GRACEFUL SHUTDOWN LIFECYCLE (Production Stability)
// =====================================================
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger_1.default.warn(`Received ${signal}. Starting graceful shutdown...`);
    // Force shutdown watchdog: exit after 10s if hanging
    const forceTimer = setTimeout(() => {
        logger_1.default.error("Graceful shutdown timed out after 10s. Force exiting.");
        process.exit(1);
    }, 10000);
    forceTimer.unref();
    if (server) {
        server.close(async () => {
            logger_1.default.info("HTTP server closed. Draining database connections...");
            try {
                await mongoose_1.default.connection.close(false);
                logger_1.default.info("MongoDB connection pool closed successfully.");
                process.exit(0);
            }
            catch (err) {
                logger_1.default.error("Error closing MongoDB connection pool: " + (err?.message || err));
                process.exit(1);
            }
        });
    }
    else {
        process.exit(0);
    }
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
// Trap unhandled exceptions & rejections
process.on("uncaughtException", (err) => {
    logger_1.default.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger_1.default.error(`Unhandled Rejection: ${reason}`);
});
startServer();
//# sourceMappingURL=server.js.map