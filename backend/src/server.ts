import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import env from "./config/env";
import logger from "./utils/logger";
import mongoose from "mongoose";
import { seedInitialVendorsIfEmpty } from "./services/vendor.service";

let server: http.Server;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await seedInitialVendorsIfEmpty();

    server = app.listen(env.PORT, "0.0.0.0", () => {
      logger.info(
        `Bloom Ecommerce API running in [${env.NODE_ENV}] mode on port ${env.PORT}`
      );
      logger.info(
        `Swagger docs available at http://localhost:${env.PORT}/api-docs`
      );
      logger.info(
        `Health check available at http://localhost:${env.PORT}/api/health`
      );
    });
  } catch (error: any) {
    logger.error("Server startup failed: " + (error?.message || error), {
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

const gracefulShutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`Received ${signal}. Starting graceful shutdown...`);

  // Force shutdown watchdog: exit after 10s if hanging
  const forceTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out after 10s. Force exiting.");
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed. Draining database connections...");
      try {
        await mongoose.connection.close(false);
        logger.info("MongoDB connection pool closed successfully.");
        process.exit(0);
      } catch (err: any) {
        logger.error("Error closing MongoDB connection pool: " + (err?.message || err));
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Trap unhandled exceptions & rejections
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

startServer();
