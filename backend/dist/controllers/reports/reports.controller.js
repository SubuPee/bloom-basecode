"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.returns = exports.settlements = exports.transactions = exports.production = exports.inventory = exports.orders = exports.sales = exports.overview = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const reports_service_1 = require("../../services/reports/reports.service");
// =====================================================
// GET /api/reports/overview
// =====================================================
exports.overview = (0, asyncHandler_1.default)(async (req, res) => {
    const { vendorId, dateRange } = req.query;
    const result = await (0, reports_service_1.getReportsOverview)({ vendorId, dateRange });
    return (0, apiResponse_1.sendSuccess)(res, result, "Reports overview retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/sales
// =====================================================
exports.sales = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getSalesReport)({
        search,
        vendorId,
        dateRange,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Sales report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/orders
// =====================================================
exports.orders = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getOrdersReport)({
        search,
        vendorId,
        dateRange,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Orders report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/inventory
// =====================================================
exports.inventory = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getInventoryReport)({
        search,
        vendorId,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Inventory report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/production
// =====================================================
exports.production = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getProductionReport)({
        search,
        vendorId,
        dateRange,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Production report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/transactions
// =====================================================
exports.transactions = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, dateRange, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getTransactionsReport)({
        search,
        vendorId,
        dateRange,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Transactions report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/settlements
// =====================================================
exports.settlements = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getSettlementsReport)({
        search,
        vendorId,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Settlements report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/returns
// =====================================================
exports.returns = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, page = "1", limit = "20" } = req.query;
    const result = await (0, reports_service_1.getReturnsReport)({
        search,
        vendorId,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Returns report retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/reports/:category/export OR /api/reports/export
// =====================================================
exports.exportReport = (0, asyncHandler_1.default)(async (req, res) => {
    const category = (req.params.category || req.query.category || "overview");
    const { vendorId, dateRange, search, format = "csv" } = req.query;
    const exportResult = await (0, reports_service_1.exportReportData)(category, { vendorId, dateRange, search }, format === "json" ? "json" : "csv");
    if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
        return res.status(httpStatusCodes_1.default.OK).send(exportResult.csvContent);
    }
    return (0, apiResponse_1.sendSuccess)(res, exportResult, "Report export generated successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=reports.controller.js.map