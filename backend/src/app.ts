import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";

import env from "./config/env";
import requestIdMiddleware from "./middleware/requestId.middleware";
import { apiLimiter } from "./middleware/rateLimiter.middleware";
import notFoundMiddleware from "./middleware/notFound.middleware";
import errorMiddleware from "./middleware/error.middleware";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

// -----------------------------------------
// Routes
// -----------------------------------------

import authRoutes from "./routes/auth.routes";
import vendorRoutes from "./routes/vendor.routes";
import categoryRoutes from "./routes/master/category.routes";
import subCategoryRoutes from "./routes/master/subCategory.routes";
import brandRoutes from "./routes/master/brand.routes";
import unitRoutes from "./routes/master/unit.routes";
import taxRoutes from "./routes/master/tax.routes";
import warehouseRoutes from "./routes/master/warehouse.routes";
import attributeRoutes from "./routes/master/attribute.routes";
import productRoutes from "./routes/product.routes";
import inventoryRoutes from "./routes/inventory/inventory.routes";
import stockMovementRoutes from "./routes/inventory/stockMovement.routes";
import stockTransferRoutes from "./routes/inventory/stockTransfer.routes";
import productionRoutes from "./routes/production/production.routes";
import productionBatchRoutes from "./routes/production/productionBatch.routes";
import settingsRoutes from "./routes/settings/settings.routes";
import reportRoutes from "./routes/reports/reports.routes";
import orderRoutes from "./routes/order.routes";
import salesRoutes from "./routes/sales.routes";
import customerRoutes from "./routes/customer.routes";
import cmsRoutes from "./routes/cms.routes";
import storefrontRoutes from "./routes/storefront.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import platformRoutes from "./routes/platform.routes";

// -----------------------------------------
// Model Registration (MUST be imported before any .populate() is called)
// -----------------------------------------
import "./models/User";
import "./models/Role";
import "./models/Permission";
import "./models/Customer";
import "./models/CmsContent";
import "./models/StorefrontConfig";
import "./models/Vendor";
import "./models/VendorRelated";
import "./models/Product";
import "./models/master/category.model";
import "./models/master/subCategory.model";
import "./models/master/brand.model";
import "./models/master/unit.model";
import "./models/master/tax.model";
import "./models/master/warehouse.model";
import "./models/master/attribute.model";
import "./models/inventory/InventoryStock";
import "./models/inventory/StockMovement";
import "./models/inventory/StockTransfer";
import "./models/production/ProductionOrder";
import "./models/production/ProductionBatch";
import "./models/settings/Notification";
import "./models/settings/WorkspaceSettings";
import "./models/settings/Integration";
import "./models/Customer";
import "./models/Order";
import "./models/platform/Offer";
import "./models/platform/Transaction";
import "./models/platform/Payout";
import "./models/platform/Refund";
import "./models/platform/Review";
import "./models/platform/SupportTicket";
import "./models/platform/ShippingZone";

const app: Application = express();

// -----------------------------------------
// Request ID & Correlation Tracking (First)
// -----------------------------------------

app.use(requestIdMiddleware);

// -----------------------------------------
// Security Headers
// -----------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// -----------------------------------------
// CORS (Configurable Origin)
// -----------------------------------------

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);

// -----------------------------------------
// Body Parsing
// -----------------------------------------

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// -----------------------------------------
// Static Files (Uploaded Compliance Documents)
// -----------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1d",
  })
);

// -----------------------------------------
// Logger
// -----------------------------------------

if (env.isDevelopment) {
  app.use(morgan("dev"));
}

// -----------------------------------------
// Rate Limiter for general API routes
// -----------------------------------------

app.use("/api", apiLimiter);

// -----------------------------------------
// Swagger API Docs
// -----------------------------------------

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// -----------------------------------------
// Root Endpoint
// -----------------------------------------

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Bloom Ecommerce API is running",
    version: "1.0.0",
    environment: env.NODE_ENV,
    requestId: req.id,
  });
});

// -----------------------------------------
// Health & Liveness / Readiness Probes
// -----------------------------------------

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "UP",
    message: "API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    requestId: req.id,
  });
});

app.get("/api/health/ready", (req: Request, res: Response) => {
  const dbStateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbState = mongoose.connection.readyState;
  const isReady = dbState === 1;

  const payload = {
    success: isReady,
    status: isReady ? "READY" : "NOT_READY",
    database: {
      status: dbStateMap[dbState] || "unknown",
      readyState: dbState,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    requestId: req.id,
  };

  res.status(isReady ? 200 : 503).json(payload);
});

// =========================================
// AUTHENTICATION ROUTES
// =========================================

app.use("/api/auth", authRoutes);

// =========================================
// MASTER ROUTES
// =========================================

app.use("/api/admin/master/categories", categoryRoutes);
app.use("/api/admin/master/sub-categories", subCategoryRoutes);
app.use("/api/admin/master/brands", brandRoutes);
app.use("/api/admin/master/units", unitRoutes);
app.use("/api/admin/master/taxes", taxRoutes);
app.use("/api/admin/master/warehouses", warehouseRoutes);
app.use("/api/admin/master/attributes", attributeRoutes);

// =========================================
// PRODUCT ROUTES
// =========================================

app.use("/api/products", productRoutes);
app.use("/api/admin/products", productRoutes);

// =========================================
// ORDER ROUTES
// =========================================

app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", orderRoutes);

// =========================================
// SALES ROUTES
// =========================================

app.use("/api/sales", salesRoutes);
app.use("/api/admin/sales", salesRoutes);

// =========================================
// CUSTOMER ROUTES
// =========================================

app.use("/api/customers", customerRoutes);
app.use("/api/admin/customers", customerRoutes);

// =========================================
// CMS ROUTES
// =========================================

app.use("/api/cms", cmsRoutes);
app.use("/api/admin/cms", cmsRoutes);

// =========================================
// STOREFRONT ROUTES
// =========================================

app.use("/api/storefront", storefrontRoutes);
app.use("/api/admin/storefront", storefrontRoutes);

// =========================================
// VENDOR MANAGEMENT ROUTES
// =========================================

app.use("/api/vendors", vendorRoutes);

// =========================================
// INVENTORY ROUTES
// =========================================

app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory", stockMovementRoutes);
app.use("/api/inventory", stockTransferRoutes);

// =========================================
// PRODUCTION ROUTES
// =========================================

app.use("/api/production", productionRoutes);
app.use("/api/production", productionBatchRoutes);

// =========================================
// SETTINGS ROUTES
// =========================================

app.use("/api/settings", settingsRoutes);

// =========================================
// REPORTS ROUTES
// =========================================

app.use("/api/reports", reportRoutes);

// =========================================
// DASHBOARD ROUTES
// =========================================

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

// =========================================
// B2C PLATFORM (CONTROL CENTRE) ROUTES
// =========================================

app.use("/api/platform", platformRoutes);
app.use("/api/admin/platform", platformRoutes);

// =========================================
// 404 NOT FOUND HANDLER
// =========================================

app.use(notFoundMiddleware);

// =========================================
// CENTRALIZED GLOBAL ERROR HANDLER
// =========================================

app.use(errorMiddleware);

export { app };
export default app;
