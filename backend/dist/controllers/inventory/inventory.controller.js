"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.outOfStock = exports.lowStock = exports.adjustmentHistory = exports.adjustInventoryStock = exports.addInboundStock = exports.stockLedger = exports.overview = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const inventory_validation_1 = require("../../validations/inventory/inventory.validation");
const inventory_service_1 = require("../../services/inventory/inventory.service");
const stockMovement_service_1 = require("../../services/inventory/stockMovement.service");
// =====================================================
// GET /api/inventory/overview
// =====================================================
exports.overview = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await (0, inventory_service_1.getInventoryOverview)();
    return (0, apiResponse_1.sendSuccess)(res, data, "Inventory overview retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/inventory/stock
// =====================================================
exports.stockLedger = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, warehouseId, status, page = "1", limit = "20", } = req.query;
    const result = await (0, inventory_service_1.getStockLedger)({
        search,
        vendorId,
        warehouseId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock ledger retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// POST /api/inventory/stock/add
// =====================================================
exports.addInboundStock = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, inventory_validation_1.validateAddStock)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const result = await (0, inventory_service_1.addStock)({ ...req.body, createdBy: String(createdBy) });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock added successfully", httpStatusCodes_1.default.CREATED);
});
// =====================================================
// POST /api/inventory/stock/adjust
// =====================================================
exports.adjustInventoryStock = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, inventory_validation_1.validateStockAdjustment)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const result = await (0, inventory_service_1.adjustStock)({ ...req.body, createdBy: String(createdBy) });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock adjustment applied", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/inventory/stock/adjust  (recent adjustments)
// =====================================================
exports.adjustmentHistory = (0, asyncHandler_1.default)(async (req, res) => {
    const { page = "1", limit = "30" } = req.query;
    const result = await (0, stockMovement_service_1.getAdjustmentHistory)({ page: parseInt(page), limit: parseInt(limit) });
    return (0, apiResponse_1.sendSuccess)(res, result, "Adjustment history retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/inventory/low-stock
// =====================================================
exports.lowStock = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, warehouseId, page = "1", limit = "20", } = req.query;
    const result = await (0, inventory_service_1.getLowStockItems)({
        search, vendorId, warehouseId,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Low stock items retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/inventory/out-of-stock
// =====================================================
exports.outOfStock = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, page = "1", limit = "20", } = req.query;
    const result = await (0, inventory_service_1.getOutOfStockItems)({
        search, vendorId,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Out of stock items retrieved", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=inventory.controller.js.map