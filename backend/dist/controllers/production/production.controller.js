"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.history = exports.cancel = exports.complete = exports.start = exports.create = exports.getOrder = exports.listOrders = exports.overview = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const production_validation_1 = require("../../validations/production/production.validation");
const production_service_1 = require("../../services/production/production.service");
// =====================================================
// GET /api/production/overview
// =====================================================
exports.overview = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await (0, production_service_1.getProductionOverview)();
    return (0, apiResponse_1.sendSuccess)(res, data, "Production overview retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/production/orders
// =====================================================
exports.listOrders = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, status, vendorId, page = "1", limit = "20", } = req.query;
    const result = await (0, production_service_1.getOrders)({
        search, status, vendorId,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Production orders retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/production/orders/:id
// =====================================================
exports.getOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const orderId = req.params.id;
    const result = await (0, production_service_1.getOrderById)(orderId);
    return (0, apiResponse_1.sendSuccess)(res, result, "Production order retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// POST /api/production/orders
// =====================================================
exports.create = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, production_validation_1.validateCreateOrder)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const order = await (0, production_service_1.createOrder)({ ...req.body, createdBy: String(createdBy) });
    return (0, apiResponse_1.sendSuccess)(res, order, "Production order scheduled", httpStatusCodes_1.default.CREATED);
});
// =====================================================
// PATCH /api/production/orders/:id/start
// =====================================================
exports.start = (0, asyncHandler_1.default)(async (req, res) => {
    const orderId = req.params.id;
    const order = await (0, production_service_1.startOrder)(orderId);
    return (0, apiResponse_1.sendSuccess)(res, order, "Production order started", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/production/orders/:id/complete
// =====================================================
exports.complete = (0, asyncHandler_1.default)(async (req, res) => {
    const orderId = req.params.id;
    const errors = (0, production_validation_1.validateCompleteOrder)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) {
        return (0, apiResponse_1.sendError)(res, "Unauthorized", httpStatusCodes_1.default.UNAUTHORIZED);
    }
    const { producedQuantity, rejectedQuantity } = req.body;
    const result = await (0, production_service_1.completeOrder)(orderId, Number(producedQuantity), Number(rejectedQuantity), String(createdBy));
    return (0, apiResponse_1.sendSuccess)(res, result, "Production completed and inventory inwarded", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/production/orders/:id/cancel
// =====================================================
exports.cancel = (0, asyncHandler_1.default)(async (req, res) => {
    const orderId = req.params.id;
    const errors = (0, production_validation_1.validateCancelOrder)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const order = await (0, production_service_1.cancelOrder)(orderId, req.body.cancelReason);
    return (0, apiResponse_1.sendSuccess)(res, order, "Production order cancelled", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/production/history
// =====================================================
exports.history = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, vendorId, dateFrom, dateTo, page = "1", limit = "20", } = req.query;
    const result = await (0, production_service_1.getProductionHistory)({
        search, vendorId, dateFrom, dateTo,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Production history retrieved", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=production.controller.js.map