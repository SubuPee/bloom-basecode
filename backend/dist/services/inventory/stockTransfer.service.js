"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransfers = exports.cancelTransfer = exports.receiveTransfer = exports.createTransfer = void 0;
const mongoose_1 = require("mongoose");
const InventoryStock_1 = require("../../models/inventory/InventoryStock");
const StockMovement_1 = require("../../models/inventory/StockMovement");
const StockTransfer_1 = require("../../models/inventory/StockTransfer");
const AppError_1 = require("../../errors/AppError");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// =====================================================
// ID GENERATOR
// =====================================================
const generateTransferId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TRF-${suffix}`;
};
const generateMovementId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SMV-${suffix}`;
};
// =====================================================
// CREATE TRANSFER (Phase 1)
// Deduct from source availableStock → add to destination inTransitStock
// =====================================================
const createTransfer = async (payload) => {
    const { productId, variantId, fromWarehouseId, toWarehouseId, quantity, batchNumber = "", notes = "", createdBy, } = payload;
    // Verify source stock exists and has enough
    const sourceStock = await InventoryStock_1.InventoryStock.findOne({
        productId, variantId, warehouseId: fromWarehouseId,
    });
    if (!sourceStock) {
        throw new AppError_1.AppError("No inventory record found at source warehouse for this variant", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (sourceStock.availableStock < quantity) {
        throw new AppError_1.AppError(`Insufficient available stock at source. Available: ${sourceStock.availableStock}, requested: ${quantity}`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    // Deduct from source
    const sourcePrev = sourceStock.availableStock;
    sourceStock.availableStock -= quantity;
    await sourceStock.save();
    // Find or create destination stock record
    let destStock = await InventoryStock_1.InventoryStock.findOne({
        productId, variantId, warehouseId: toWarehouseId,
    });
    if (!destStock) {
        destStock = await InventoryStock_1.InventoryStock.create({
            productId: new mongoose_1.Types.ObjectId(productId),
            variantId,
            warehouseId: new mongoose_1.Types.ObjectId(toWarehouseId),
            vendorId: sourceStock.vendorId,
            sku: sourceStock.sku,
            unitCode: sourceStock.unitCode,
            batchNumber,
            availableStock: 0,
            reservedStock: 0,
            inTransitStock: 0,
            damagedStock: 0,
            expiredStock: 0,
        });
    }
    destStock.inTransitStock += quantity;
    await destStock.save();
    // Create the transfer record
    const transferId = generateTransferId();
    const transfer = await StockTransfer_1.StockTransfer.create({
        transferId,
        productId: new mongoose_1.Types.ObjectId(productId),
        variantId,
        fromWarehouseId: new mongoose_1.Types.ObjectId(fromWarehouseId),
        toWarehouseId: new mongoose_1.Types.ObjectId(toWarehouseId),
        quantity,
        status: "In Transit",
        batchNumber,
        notes,
        dispatchedAt: new Date(),
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    // Ledger: Transfer Out (source)
    await StockMovement_1.StockMovement.create({
        movementId: generateMovementId(),
        productId: new mongoose_1.Types.ObjectId(productId),
        variantId,
        warehouseId: new mongoose_1.Types.ObjectId(fromWarehouseId),
        vendorId: sourceStock.vendorId,
        movementType: "Transfer Out",
        referenceId: transferId,
        quantity: -quantity,
        previousStock: sourcePrev,
        newStock: sourceStock.availableStock,
        batchNumber,
        location: "",
        notes: `Transfer to warehouse ${toWarehouseId}. ${notes}`.trim(),
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return { transfer, sourceStock, destStock };
};
exports.createTransfer = createTransfer;
// =====================================================
// RECEIVE TRANSFER (Phase 2)
// Convert destination inTransitStock → availableStock
// =====================================================
const receiveTransfer = async (transferId, createdBy) => {
    const transfer = await StockTransfer_1.StockTransfer.findOne({ transferId });
    if (!transfer) {
        throw new AppError_1.AppError("Transfer not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (transfer.status !== "In Transit") {
        throw new AppError_1.AppError(`Transfer cannot be received — current status is '${transfer.status}'`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    const destStock = await InventoryStock_1.InventoryStock.findOne({
        productId: transfer.productId,
        variantId: transfer.variantId,
        warehouseId: transfer.toWarehouseId,
    });
    if (!destStock) {
        throw new AppError_1.AppError("Destination inventory record not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    const prevInTransit = destStock.inTransitStock;
    const prevAvailable = destStock.availableStock;
    destStock.inTransitStock = Math.max(0, destStock.inTransitStock - transfer.quantity);
    destStock.availableStock += transfer.quantity;
    await destStock.save();
    transfer.status = "Completed";
    transfer.receivedAt = new Date();
    await transfer.save();
    // Ledger: Transfer In (destination)
    await StockMovement_1.StockMovement.create({
        movementId: generateMovementId(),
        productId: transfer.productId,
        variantId: transfer.variantId,
        warehouseId: transfer.toWarehouseId,
        movementType: "Transfer In",
        referenceId: transfer.transferId,
        quantity: transfer.quantity,
        previousStock: prevAvailable,
        newStock: destStock.availableStock,
        batchNumber: transfer.batchNumber,
        location: "",
        notes: `Transfer received from warehouse ${transfer.fromWarehouseId}`,
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return { transfer, destStock };
};
exports.receiveTransfer = receiveTransfer;
// =====================================================
// CANCEL TRANSFER
// Reverse the source deduction
// =====================================================
const cancelTransfer = async (transferId, cancelReason, createdBy) => {
    const transfer = await StockTransfer_1.StockTransfer.findOne({ transferId });
    if (!transfer) {
        throw new AppError_1.AppError("Transfer not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (transfer.status !== "In Transit" && transfer.status !== "Pending") {
        throw new AppError_1.AppError(`Transfer cannot be cancelled — current status is '${transfer.status}'`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    // Restore source availableStock
    const sourceStock = await InventoryStock_1.InventoryStock.findOne({
        productId: transfer.productId,
        variantId: transfer.variantId,
        warehouseId: transfer.fromWarehouseId,
    });
    if (sourceStock) {
        const prev = sourceStock.availableStock;
        sourceStock.availableStock += transfer.quantity;
        await sourceStock.save();
        await StockMovement_1.StockMovement.create({
            movementId: generateMovementId(),
            productId: transfer.productId,
            variantId: transfer.variantId,
            warehouseId: transfer.fromWarehouseId,
            movementType: "Order Cancellation",
            referenceId: transfer.transferId,
            quantity: transfer.quantity,
            previousStock: prev,
            newStock: sourceStock.availableStock,
            batchNumber: transfer.batchNumber,
            location: "",
            notes: `Transfer cancelled: ${cancelReason}`,
            createdBy: new mongoose_1.Types.ObjectId(createdBy),
        });
    }
    // Clear destination inTransitStock
    const destStock = await InventoryStock_1.InventoryStock.findOne({
        productId: transfer.productId,
        variantId: transfer.variantId,
        warehouseId: transfer.toWarehouseId,
    });
    if (destStock) {
        destStock.inTransitStock = Math.max(0, destStock.inTransitStock - transfer.quantity);
        await destStock.save();
    }
    transfer.status = "Cancelled";
    transfer.cancelledAt = new Date();
    transfer.cancelReason = cancelReason;
    await transfer.save();
    return { transfer };
};
exports.cancelTransfer = cancelTransfer;
// =====================================================
// LIST TRANSFERS
// =====================================================
const getTransfers = async (filters) => {
    const { status, fromWarehouseId, toWarehouseId, page = 1, limit = 20 } = filters;
    const query = {};
    if (status && status !== "All")
        query.status = status;
    if (fromWarehouseId)
        query.fromWarehouseId = new mongoose_1.Types.ObjectId(fromWarehouseId);
    if (toWarehouseId)
        query.toWarehouseId = new mongoose_1.Types.ObjectId(toWarehouseId);
    const [total, docs] = await Promise.all([
        StockTransfer_1.StockTransfer.countDocuments(query),
        StockTransfer_1.StockTransfer.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("productId", "name")
            .populate("fromWarehouseId", "name city")
            .populate("toWarehouseId", "name city")
            .populate("createdBy", "name email")
            .lean(),
    ]);
    return {
        data: docs,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getTransfers = getTransfers;
//# sourceMappingURL=stockTransfer.service.js.map