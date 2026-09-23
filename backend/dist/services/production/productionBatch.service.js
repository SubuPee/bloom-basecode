"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBatchStatus = exports.getBatches = void 0;
const mongoose_1 = require("mongoose");
const ProductionBatch_1 = require("../../models/production/ProductionBatch");
const AppError_1 = require("../../errors/AppError");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// =====================================================
// PRODUCTION BATCH SERVICE — Batch queries
// =====================================================
const getBatches = async (filters) => {
    const { search, status, page = 1, limit = 20 } = filters;
    const query = {};
    if (status && status !== "All")
        query.status = status;
    let docs = await ProductionBatch_1.ProductionBatch.find(query)
        .sort({ createdAt: -1 })
        .populate("productId", "name category")
        .populate("vendorId", "businessName")
        .populate("warehouseId", "name city")
        .populate("productionOrderId", "orderId status")
        .lean();
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((b) => {
            const product = b.productId;
            const vendor = b.vendorId;
            return (b.batchNumber.toLowerCase().includes(q) ||
                b.variantId.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                (vendor?.businessName || "").toLowerCase().includes(q));
        });
    }
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    // Stats for cards
    const allBatches = await ProductionBatch_1.ProductionBatch.find().lean();
    const activeBatches = allBatches.filter((b) => b.status === "Active").length;
    const expiredBatches = allBatches.filter((b) => b.status === "Expired").length;
    const quarantinedBatches = allBatches.filter((b) => b.status === "Quarantined").length;
    const totalAvailable = allBatches.reduce((s, b) => s + b.availableQuantity, 0);
    return {
        stats: { activeBatches, expiredBatches, quarantinedBatches, totalAvailable },
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getBatches = getBatches;
const updateBatchStatus = async (idOrBatchNumber, status) => {
    const query = mongoose_1.Types.ObjectId.isValid(idOrBatchNumber)
        ? { $or: [{ _id: idOrBatchNumber }, { batchNumber: idOrBatchNumber }] }
        : { batchNumber: idOrBatchNumber };
    const batch = await ProductionBatch_1.ProductionBatch.findOne(query);
    if (!batch) {
        throw new AppError_1.AppError("Production batch not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    batch.status = status;
    await batch.save();
    return batch;
};
exports.updateBatchStatus = updateBatchStatus;
//# sourceMappingURL=productionBatch.service.js.map