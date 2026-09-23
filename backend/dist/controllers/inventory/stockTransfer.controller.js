"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelTransferHandler = exports.confirmReceive = exports.listTransfers = exports.initTransfer = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const stockTransfer_validation_1 = require("../../validations/inventory/stockTransfer.validation");
const stockTransfer_service_1 = require("../../services/inventory/stockTransfer.service");
// =====================================================
// POST /api/inventory/transfers
// =====================================================
exports.initTransfer = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, stockTransfer_validation_1.validateCreateTransfer)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const result = await (0, stockTransfer_service_1.createTransfer)({ ...req.body, createdBy: String(createdBy) });
    return (0, apiResponse_1.sendSuccess)(res, result, "Stock transfer initiated", httpStatusCodes_1.default.CREATED);
});
// =====================================================
// GET /api/inventory/transfers
// =====================================================
exports.listTransfers = (0, asyncHandler_1.default)(async (req, res) => {
    const { status, fromWarehouseId, toWarehouseId, page = "1", limit = "20", } = req.query;
    const result = await (0, stockTransfer_service_1.getTransfers)({
        status, fromWarehouseId, toWarehouseId,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Transfers retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/inventory/transfers/:id/receive
// =====================================================
exports.confirmReceive = (0, asyncHandler_1.default)(async (req, res) => {
    const transferId = req.params.id;
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const result = await (0, stockTransfer_service_1.receiveTransfer)(transferId, String(createdBy));
    return (0, apiResponse_1.sendSuccess)(res, result, "Transfer received and stock updated", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/inventory/transfers/:id/cancel
// =====================================================
exports.cancelTransferHandler = (0, asyncHandler_1.default)(async (req, res) => {
    const transferId = req.params.id;
    const errors = (0, stockTransfer_validation_1.validateCancelTransfer)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const result = await (0, stockTransfer_service_1.cancelTransfer)(transferId, req.body.cancelReason, String(createdBy));
    return (0, apiResponse_1.sendSuccess)(res, result, "Transfer cancelled and stock reversed", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=stockTransfer.controller.js.map