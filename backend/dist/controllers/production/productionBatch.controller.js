"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.listBatches = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const productionBatch_service_1 = require("../../services/production/productionBatch.service");
// =====================================================
// GET /api/production/batches
// =====================================================
exports.listBatches = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, status, page = "1", limit = "20", } = req.query;
    const result = await (0, productionBatch_service_1.getBatches)({
        search, status,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Production batches retrieved", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/production/batches/:id/status
// =====================================================
exports.updateStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const result = await (0, productionBatch_service_1.updateBatchStatus)(id, status);
    return (0, apiResponse_1.sendSuccess)(res, result, "Batch status updated", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=productionBatch.controller.js.map