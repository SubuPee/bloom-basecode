"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditHistory = exports.movementsLedger = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const stockMovement_service_1 = require("../../services/inventory/stockMovement.service");
// =====================================================
// GET /api/inventory/movements
// =====================================================
exports.movementsLedger = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, movementType, vendorId, warehouseId, dateFrom, dateTo, page = "1", limit = "30", } = req.query;
    const result = await (0, stockMovement_service_1.getMovements)({
        search, movementType, vendorId, warehouseId,
        dateFrom, dateTo,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock movement ledger retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/inventory/history
// =====================================================
exports.auditHistory = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, movementType, dateFrom, dateTo, page = "1", limit = "30", } = req.query;
    const result = await (0, stockMovement_service_1.getAuditHistory)({
        search, movementType,
        dateFrom, dateTo,
        page: parseInt(page),
        limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock audit history retrieved", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=stockMovement.controller.js.map