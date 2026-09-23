"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const env_1 = __importDefault(require("./config/env"));
const requestId_middleware_1 = __importDefault(require("./middleware/requestId.middleware"));
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const notFound_middleware_1 = __importDefault(require("./middleware/notFound.middleware"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
// -----------------------------------------
// Routes
// -----------------------------------------
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const vendor_routes_1 = __importDefault(require("./routes/vendor.routes"));
const category_routes_1 = __importDefault(require("./routes/master/category.routes"));
const subCategory_routes_1 = __importDefault(require("./routes/master/subCategory.routes"));
const brand_routes_1 = __importDefault(require("./routes/master/brand.routes"));
const unit_routes_1 = __importDefault(require("./routes/master/unit.routes"));
const tax_routes_1 = __importDefault(require("./routes/master/tax.routes"));
const warehouse_routes_1 = __importDefault(require("./routes/master/warehouse.routes"));
const attribute_routes_1 = __importDefault(require("./routes/master/attribute.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory/inventory.routes"));
const stockMovement_routes_1 = __importDefault(require("./routes/inventory/stockMovement.routes"));
const stockTransfer_routes_1 = __importDefault(require("./routes/inventory/stockTransfer.routes"));
const production_routes_1 = __importDefault(require("./routes/production/production.routes"));
const productionBatch_routes_1 = __importDefault(require("./routes/production/productionBatch.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings/settings.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports/reports.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const cms_routes_1 = __importDefault(require("./routes/cms.routes"));
const storefront_routes_1 = __importDefault(require("./routes/storefront.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const platform_routes_1 = __importDefault(require("./routes/platform.routes"));
// -----------------------------------------
// Model Registration (MUST be imported before any .populate() is called)
// -----------------------------------------
require("./models/User");
require("./models/Role");
require("./models/Permission");
require("./models/Customer");
require("./models/CmsContent");
require("./models/StorefrontConfig");
require("./models/Vendor");
require("./models/VendorRelated");
require("./models/Product");
require("./models/master/category.model");
require("./models/master/subCategory.model");
require("./models/master/brand.model");
require("./models/master/unit.model");
require("./models/master/tax.model");
require("./models/master/warehouse.model");
require("./models/master/attribute.model");
require("./models/inventory/InventoryStock");
require("./models/inventory/StockMovement");
require("./models/inventory/StockTransfer");
require("./models/production/ProductionOrder");
require("./models/production/ProductionBatch");
require("./models/settings/Notification");
require("./models/settings/WorkspaceSettings");
require("./models/settings/Integration");
require("./models/Customer");
require("./models/Order");
require("./models/platform/Offer");
require("./models/platform/Transaction");
require("./models/platform/Payout");
require("./models/platform/Refund");
require("./models/platform/Review");
require("./models/platform/SupportTicket");
require("./models/platform/ShippingZone");
const app = (0, express_1.default)();
exports.app = app;
// -----------------------------------------
// Request ID & Correlation Tracking (First)
// -----------------------------------------
app.use(requestId_middleware_1.default);
// -----------------------------------------
// Security Headers
// -----------------------------------------
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// -----------------------------------------
// CORS (Configurable Origin)
// -----------------------------------------
app.use((0, cors_1.default)({
    origin: env_1.default.CORS_ORIGIN === "*" ? true : env_1.default.CORS_ORIGIN,
    credentials: true,
}));
// -----------------------------------------
// Body Parsing
// -----------------------------------------
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, cookie_parser_1.default)());
// -----------------------------------------
// Static Files (Uploaded Compliance Documents)
// -----------------------------------------
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads"), {
    maxAge: "1d",
}));
// -----------------------------------------
// Logger
// -----------------------------------------
if (env_1.default.isDevelopment) {
    app.use((0, morgan_1.default)("dev"));
}
// -----------------------------------------
// Rate Limiter for general API routes
// -----------------------------------------
app.use("/api", rateLimiter_middleware_1.apiLimiter);
// -----------------------------------------
// Swagger API Docs
// -----------------------------------------
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// -----------------------------------------
// Root Endpoint
// -----------------------------------------
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Bloom Ecommerce API is running",
        version: "1.0.0",
        environment: env_1.default.NODE_ENV,
        requestId: req.id,
    });
});
// -----------------------------------------
// Health & Liveness / Readiness Probes
// -----------------------------------------
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "UP",
        message: "API is healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env_1.default.NODE_ENV,
        requestId: req.id,
    });
});
app.get("/api/health/ready", (req, res) => {
    const dbStateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };
    const dbState = mongoose_1.default.connection.readyState;
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
app.use("/api/auth", auth_routes_1.default);
// =========================================
// MASTER ROUTES
// =========================================
app.use("/api/admin/master/categories", category_routes_1.default);
app.use("/api/admin/master/sub-categories", subCategory_routes_1.default);
app.use("/api/admin/master/brands", brand_routes_1.default);
app.use("/api/admin/master/units", unit_routes_1.default);
app.use("/api/admin/master/taxes", tax_routes_1.default);
app.use("/api/admin/master/warehouses", warehouse_routes_1.default);
app.use("/api/admin/master/attributes", attribute_routes_1.default);
// =========================================
// PRODUCT ROUTES
// =========================================
app.use("/api/products", product_routes_1.default);
app.use("/api/admin/products", product_routes_1.default);
// =========================================
// ORDER ROUTES
// =========================================
app.use("/api/orders", order_routes_1.default);
app.use("/api/admin/orders", order_routes_1.default);
// =========================================
// SALES ROUTES
// =========================================
app.use("/api/sales", sales_routes_1.default);
app.use("/api/admin/sales", sales_routes_1.default);
// =========================================
// CUSTOMER ROUTES
// =========================================
app.use("/api/customers", customer_routes_1.default);
app.use("/api/admin/customers", customer_routes_1.default);
// =========================================
// CMS ROUTES
// =========================================
app.use("/api/cms", cms_routes_1.default);
app.use("/api/admin/cms", cms_routes_1.default);
// =========================================
// STOREFRONT ROUTES
// =========================================
app.use("/api/storefront", storefront_routes_1.default);
app.use("/api/admin/storefront", storefront_routes_1.default);
// =========================================
// VENDOR MANAGEMENT ROUTES
// =========================================
app.use("/api/vendors", vendor_routes_1.default);
// =========================================
// INVENTORY ROUTES
// =========================================
app.use("/api/inventory", inventory_routes_1.default);
app.use("/api/inventory", stockMovement_routes_1.default);
app.use("/api/inventory", stockTransfer_routes_1.default);
// =========================================
// PRODUCTION ROUTES
// =========================================
app.use("/api/production", production_routes_1.default);
app.use("/api/production", productionBatch_routes_1.default);
// =========================================
// SETTINGS ROUTES
// =========================================
app.use("/api/settings", settings_routes_1.default);
// =========================================
// REPORTS ROUTES
// =========================================
app.use("/api/reports", reports_routes_1.default);
// =========================================
// DASHBOARD ROUTES
// =========================================
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/admin/dashboard", dashboard_routes_1.default);
// =========================================
// B2C PLATFORM (CONTROL CENTRE) ROUTES
// =========================================
app.use("/api/platform", platform_routes_1.default);
app.use("/api/admin/platform", platform_routes_1.default);
// =========================================
// 404 NOT FOUND HANDLER
// =========================================
app.use(notFound_middleware_1.default);
// =========================================
// CENTRALIZED GLOBAL ERROR HANDLER
// =========================================
app.use(error_middleware_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map