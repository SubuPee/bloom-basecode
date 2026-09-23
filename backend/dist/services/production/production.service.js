"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductionHistory = exports.cancelOrder = exports.completeOrder = exports.startOrder = exports.createOrder = exports.getOrderById = exports.getOrders = exports.getProductionOverview = void 0;
const mongoose_1 = require("mongoose");
const ProductionOrder_1 = require("../../models/production/ProductionOrder");
const ProductionBatch_1 = require("../../models/production/ProductionBatch");
const InventoryStock_1 = require("../../models/inventory/InventoryStock");
const StockMovement_1 = require("../../models/inventory/StockMovement");
const AppError_1 = require("../../errors/AppError");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// =====================================================
// ID GENERATORS
// =====================================================
const generateOrderId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PRD-${suffix}`;
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
// OVERVIEW
// =====================================================
const getProductionOverview = async () => {
    const allOrders = await ProductionOrder_1.ProductionOrder.find()
        .populate("productId", "name category")
        .populate("vendorId", "businessName")
        .populate("warehouseId", "name city")
        .lean();
    const totalOrders = allOrders.length;
    const activeOrders = allOrders.filter((o) => o.status === "Planned" || o.status === "In Progress" || o.status === "Partially Completed");
    const completedOrders = allOrders.filter((o) => o.status === "Completed");
    const cancelledOrders = allOrders.filter((o) => o.status === "Cancelled");
    const totalProduced = allOrders.reduce((s, o) => s + o.producedQuantity, 0);
    const totalGood = allOrders.reduce((s, o) => s + o.goodQuantity, 0);
    const totalRejected = allOrders.reduce((s, o) => s + o.rejectedQuantity, 0);
    const yieldPercentage = totalProduced > 0
        ? Math.round((totalGood / totalProduced) * 100)
        : 100;
    // Recent batches for sidebar
    const recentBatches = await ProductionBatch_1.ProductionBatch.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("productId", "name")
        .populate("warehouseId", "name")
        .lean();
    return {
        totalOrders,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalProduced,
        totalGood,
        totalRejected,
        yieldPercentage,
        activeOrders,
        recentBatches,
    };
};
exports.getProductionOverview = getProductionOverview;
// =====================================================
// LIST ORDERS (with filters)
// =====================================================
const getOrders = async (filters) => {
    const { search, status, vendorId, page = 1, limit = 20 } = filters;
    const query = {};
    if (status && status !== "All")
        query.status = status;
    if (vendorId)
        query.vendorId = new mongoose_1.Types.ObjectId(vendorId);
    let docs = await ProductionOrder_1.ProductionOrder.find(query)
        .sort({ createdAt: -1 })
        .populate("productId", "name category")
        .populate("vendorId", "businessName")
        .populate("warehouseId", "name city")
        .populate("createdBy", "name email")
        .lean();
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((o) => {
            const product = o.productId;
            const vendor = o.vendorId;
            return (o.orderId.toLowerCase().includes(q) ||
                o.batchNumber.toLowerCase().includes(q) ||
                o.variantId.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                (vendor?.businessName || "").toLowerCase().includes(q));
        });
    }
    const allOrders = await ProductionOrder_1.ProductionOrder.find().lean();
    const totalOrders = allOrders.length;
    const planned = allOrders.filter((o) => o.status === "Planned").length;
    const inProgress = allOrders.filter((o) => o.status === "In Progress").length;
    const completed = allOrders.filter((o) => o.status === "Completed").length;
    const cancelled = allOrders.filter((o) => o.status === "Cancelled").length;
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        stats: { totalOrders, planned, inProgress, completed, cancelled },
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getOrders = getOrders;
const buildOrderQuery = (id) => {
    return mongoose_1.Types.ObjectId.isValid(id) ? { $or: [{ orderId: id }, { _id: id }] } : { orderId: id };
};
// =====================================================
// GET SINGLE ORDER
// =====================================================
const getOrderById = async (orderId) => {
    const order = await ProductionOrder_1.ProductionOrder.findOne(buildOrderQuery(orderId))
        .populate("productId", "name category")
        .populate("vendorId", "businessName ownerName")
        .populate("warehouseId", "name city")
        .populate("createdBy", "name email")
        .lean();
    if (!order) {
        throw new AppError_1.AppError("Production order not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    // Find related batch if exists
    const relatedBatch = await ProductionBatch_1.ProductionBatch.findOne({ batchNumber: order.batchNumber })
        .populate("warehouseId", "name")
        .lean();
    return { order, relatedBatch };
};
exports.getOrderById = getOrderById;
// =====================================================
// CREATE ORDER
// =====================================================
const createOrder = async (payload) => {
    const { productId, variantId, vendorId, batchNumber, plannedQuantity, unit, warehouseId, storageLocation = "", expectedCompletion, notes = "", rawMaterials = [], createdBy, } = payload;
    const orderId = generateOrderId();
    const order = await ProductionOrder_1.ProductionOrder.create({
        orderId,
        productId: new mongoose_1.Types.ObjectId(productId),
        variantId,
        vendorId: new mongoose_1.Types.ObjectId(vendorId),
        batchNumber,
        plannedQuantity,
        producedQuantity: 0,
        goodQuantity: 0,
        rejectedQuantity: 0,
        unit,
        status: "Planned",
        warehouseId: new mongoose_1.Types.ObjectId(warehouseId),
        storageLocation,
        expectedCompletion: new Date(expectedCompletion),
        notes,
        rawMaterials,
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return order;
};
exports.createOrder = createOrder;
// =====================================================
// START ORDER (Planned → In Progress)
// =====================================================
const startOrder = async (orderId) => {
    const order = await ProductionOrder_1.ProductionOrder.findOne(buildOrderQuery(orderId));
    if (!order) {
        throw new AppError_1.AppError("Production order not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (order.status !== "Planned") {
        throw new AppError_1.AppError(`Order cannot be started — current status is '${order.status}'. Only 'Planned' orders can be started.`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    order.status = "In Progress";
    order.startedAt = new Date();
    await order.save();
    return order;
};
exports.startOrder = startOrder;
// =====================================================
// COMPLETE ORDER — QA Output + Inventory Inwarding
// =====================================================
const completeOrder = async (orderId, producedQuantity, rejectedQuantity, createdBy) => {
    const order = await ProductionOrder_1.ProductionOrder.findOne(buildOrderQuery(orderId));
    if (!order) {
        throw new AppError_1.AppError("Production order not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (order.status !== "In Progress" && order.status !== "Planned") {
        throw new AppError_1.AppError(`Order cannot be completed — current status is '${order.status}'`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    const goodQuantity = producedQuantity - rejectedQuantity;
    // Update order
    order.producedQuantity = producedQuantity;
    order.goodQuantity = goodQuantity;
    order.rejectedQuantity = rejectedQuantity;
    order.completedAt = new Date();
    order.status = producedQuantity >= order.plannedQuantity ? "Completed" : "Partially Completed";
    await order.save();
    // ----- INVENTORY INWARDING -----
    // Find or create InventoryStock record at the destination warehouse
    let stock = await InventoryStock_1.InventoryStock.findOne({
        productId: order.productId,
        variantId: order.variantId,
        warehouseId: order.warehouseId,
    });
    if (!stock) {
        stock = await InventoryStock_1.InventoryStock.create({
            productId: order.productId,
            variantId: order.variantId,
            warehouseId: order.warehouseId,
            vendorId: order.vendorId,
            sku: order.variantId,
            unitCode: order.unit,
            batchNumber: order.batchNumber,
            availableStock: 0,
            reservedStock: 0,
            inTransitStock: 0,
            damagedStock: 0,
            expiredStock: 0,
        });
    }
    // Inward good output → availableStock
    if (goodQuantity > 0) {
        const prevAvailable = stock.availableStock;
        stock.availableStock += goodQuantity;
        await StockMovement_1.StockMovement.create({
            movementId: generateMovementId(),
            productId: order.productId,
            variantId: order.variantId,
            warehouseId: order.warehouseId,
            vendorId: order.vendorId,
            movementType: "Production",
            referenceId: order.orderId,
            quantity: goodQuantity,
            previousStock: prevAvailable,
            newStock: stock.availableStock,
            batchNumber: order.batchNumber,
            location: order.storageLocation,
            notes: `Production order ${order.orderId} completed. Good output: ${goodQuantity} ${order.unit}`,
            createdBy: new mongoose_1.Types.ObjectId(createdBy),
        });
    }
    // Inward rejected units → damagedStock
    if (rejectedQuantity > 0) {
        const prevDamaged = stock.damagedStock;
        stock.damagedStock += rejectedQuantity;
        await StockMovement_1.StockMovement.create({
            movementId: generateMovementId(),
            productId: order.productId,
            variantId: order.variantId,
            warehouseId: order.warehouseId,
            vendorId: order.vendorId,
            movementType: "Damage",
            referenceId: order.orderId,
            quantity: -rejectedQuantity,
            previousStock: prevDamaged,
            newStock: stock.damagedStock,
            batchNumber: order.batchNumber,
            location: order.storageLocation,
            notes: `Production QA rejects from order ${order.orderId}. ${rejectedQuantity} ${order.unit} quarantined.`,
            createdBy: new mongoose_1.Types.ObjectId(createdBy),
        });
    }
    await stock.save();
    // ----- AUTO-CREATE PRODUCTION BATCH -----
    const batch = await ProductionBatch_1.ProductionBatch.create({
        batchNumber: order.batchNumber,
        productionOrderId: order._id,
        productId: order.productId,
        variantId: order.variantId,
        vendorId: order.vendorId,
        totalQuantity: goodQuantity,
        availableQuantity: goodQuantity,
        status: "Active",
        warehouseId: order.warehouseId,
        location: order.storageLocation,
        manufacturingDate: new Date(),
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return { order, stock, batch };
};
exports.completeOrder = completeOrder;
// =====================================================
// CANCEL ORDER
// =====================================================
const cancelOrder = async (orderId, cancelReason) => {
    const order = await ProductionOrder_1.ProductionOrder.findOne(buildOrderQuery(orderId));
    if (!order) {
        throw new AppError_1.AppError("Production order not found", httpStatusCodes_1.default.NOT_FOUND);
    }
    if (order.status !== "Planned" && order.status !== "In Progress") {
        throw new AppError_1.AppError(`Order cannot be cancelled — current status is '${order.status}'`, httpStatusCodes_1.default.BAD_REQUEST);
    }
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason;
    await order.save();
    return order;
};
exports.cancelOrder = cancelOrder;
// =====================================================
// PRODUCTION HISTORY (completed + cancelled)
// =====================================================
const getProductionHistory = async (filters) => {
    const { search, vendorId, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const query = {
        status: { $in: ["Completed", "Partially Completed", "Cancelled"] },
    };
    if (vendorId)
        query.vendorId = new mongoose_1.Types.ObjectId(vendorId);
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom)
            query.createdAt.$gte = new Date(dateFrom);
        if (dateTo)
            query.createdAt.$lte = new Date(dateTo + "T23:59:59Z");
    }
    let docs = await ProductionOrder_1.ProductionOrder.find(query)
        .sort({ completedAt: -1, cancelledAt: -1, createdAt: -1 })
        .populate("productId", "name category")
        .populate("vendorId", "businessName")
        .populate("warehouseId", "name city")
        .populate("createdBy", "name email")
        .lean();
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((o) => {
            const product = o.productId;
            const vendor = o.vendorId;
            return (o.orderId.toLowerCase().includes(q) ||
                o.batchNumber.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                (vendor?.businessName || "").toLowerCase().includes(q));
        });
    }
    const totalCompleted = docs.filter((o) => o.status === "Completed").length;
    const totalCancelled = docs.filter((o) => o.status === "Cancelled").length;
    const totalProduced = docs.reduce((s, o) => s + (o.producedQuantity || 0), 0);
    const totalGood = docs.reduce((s, o) => s + (o.goodQuantity || 0), 0);
    const totalRejected = docs.reduce((s, o) => s + (o.rejectedQuantity || 0), 0);
    const overallYieldRate = totalProduced > 0 ? Math.round((totalGood / totalProduced) * 100) : 100;
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        stats: { totalCompleted, totalCancelled, totalProduced, totalGood, totalRejected, overallYieldRate },
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getProductionHistory = getProductionHistory;
//# sourceMappingURL=production.service.js.map