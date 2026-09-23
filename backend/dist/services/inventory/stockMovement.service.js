"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdjustmentHistory = exports.getAuditHistory = exports.getMovements = void 0;
const StockMovement_1 = require("../../models/inventory/StockMovement");
// =====================================================
// STOCK MOVEMENT SERVICE — Ledger reads
// =====================================================
const ADJUSTMENT_TYPES = [
    "Adjustment",
    "Damage",
    "Expiry",
    "Manual Addition",
    "Manual Deduction",
];
const getMovements = async (filters) => {
    const { search, movementType, vendorId, warehouseId, dateFrom, dateTo, page = 1, limit = 30, } = filters;
    const query = {};
    if (movementType && movementType !== "All") {
        query.movementType = movementType;
    }
    if (vendorId)
        query.vendorId = vendorId;
    if (warehouseId)
        query.warehouseId = warehouseId;
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom)
            query.createdAt.$gte = new Date(dateFrom);
        if (dateTo)
            query.createdAt.$lte = new Date(dateTo + "T23:59:59Z");
    }
    let docs = await StockMovement_1.StockMovement.find(query)
        .sort({ createdAt: -1 })
        .populate("productId", "name")
        .populate("warehouseId", "name city")
        .populate("vendorId", "businessName")
        .populate("createdBy", "name email")
        .lean();
    // Post-populate text search
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((m) => {
            const product = m.productId;
            const vendor = m.vendorId;
            return (m.movementId.toLowerCase().includes(q) ||
                m.referenceId.toLowerCase().includes(q) ||
                m.variantId.toLowerCase().includes(q) ||
                m.batchNumber.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                (vendor?.businessName || "").toLowerCase().includes(q) ||
                (m.notes || "").toLowerCase().includes(q));
        });
    }
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getMovements = getMovements;
const getAuditHistory = async (filters) => {
    // History is movements with optional date-range filter — full audit trail
    return (0, exports.getMovements)(filters);
};
exports.getAuditHistory = getAuditHistory;
const getAdjustmentHistory = async (filters) => {
    const { page = 1, limit = 30 } = filters;
    const docs = await StockMovement_1.StockMovement.find({ movementType: { $in: ADJUSTMENT_TYPES } })
        .sort({ createdAt: -1 })
        .populate("productId", "name")
        .populate("warehouseId", "name city")
        .populate("createdBy", "name email")
        .lean();
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getAdjustmentHistory = getAdjustmentHistory;
//# sourceMappingURL=stockMovement.service.js.map