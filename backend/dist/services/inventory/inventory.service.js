"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutOfStockItems = exports.getLowStockItems = exports.adjustStock = exports.addStock = exports.getStockLedger = exports.getInventoryOverview = void 0;
const mongoose_1 = require("mongoose");
const InventoryStock_1 = require("../../models/inventory/InventoryStock");
const StockMovement_1 = require("../../models/inventory/StockMovement");
const AppError_1 = require("../../errors/AppError");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
// =====================================================
// ID GENERATOR
// =====================================================
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
const getInventoryOverview = async () => {
    const stocks = await InventoryStock_1.InventoryStock.find({ softDeleted: false })
        .populate("productId", "name category")
        .populate("warehouseId", "name")
        .lean();
    const availableStock = stocks.reduce((s, r) => s + r.availableStock, 0);
    const reservedStock = stocks.reduce((s, r) => s + r.reservedStock, 0);
    const inTransitStock = stocks.reduce((s, r) => s + r.inTransitStock, 0);
    const damagedStock = stocks.reduce((s, r) => s + r.damagedStock, 0);
    const expiredStock = stocks.reduce((s, r) => s + r.expiredStock, 0);
    // Category breakdown for bar chart
    const categoryMap = {};
    for (const s of stocks) {
        const product = s.productId;
        const cat = product?.category || "Uncategorised";
        if (!categoryMap[cat])
            categoryMap[cat] = { available: 0, reserved: 0 };
        categoryMap[cat].available += s.availableStock;
        categoryMap[cat].reserved += s.reservedStock;
    }
    const categoryStockData = Object.entries(categoryMap).map(([name, v]) => ({
        name,
        available: v.available,
        reserved: v.reserved,
    }));
    // Stock split for pie chart
    const stockSplit = [
        { name: "Available", value: availableStock, color: "var(--blue)" },
        { name: "Reserved", value: reservedStock, color: "var(--pink)" },
        { name: "In Transit", value: inTransitStock, color: "var(--gold)" },
        { name: "Damaged", value: damagedStock, color: "var(--orange)" },
        { name: "Expired", value: expiredStock, color: "var(--destructive)" },
    ];
    // Last 5 movements for the overview table
    const recentMovements = await StockMovement_1.StockMovement.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("productId", "name")
        .populate("warehouseId", "name")
        .populate("createdBy", "name email")
        .lean();
    return {
        availableStock,
        reservedStock,
        inTransitStock,
        damagedStock,
        expiredStock,
        categoryStockData,
        stockSplit,
        recentMovements,
    };
};
exports.getInventoryOverview = getInventoryOverview;
// =====================================================
// PRODUCT STOCK LEDGER
// =====================================================
const getStockLedger = async (filters) => {
    const { search, vendorId, warehouseId, status, page = 1, limit = 20 } = filters;
    const query = { softDeleted: false };
    if (vendorId && mongoose_1.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose_1.Types.ObjectId(vendorId);
    }
    if (warehouseId && mongoose_1.Types.ObjectId.isValid(warehouseId)) {
        query.warehouseId = new mongoose_1.Types.ObjectId(warehouseId);
    }
    if (status === "Out of Stock") {
        query.availableStock = 0;
    }
    else if (status === "Low Stock") {
        query.$expr = { $and: [{ $lte: ["$availableStock", "$minStock"] }, { $gt: ["$availableStock", 0] }] };
    }
    else if (status === "In Stock") {
        query.$expr = { $gt: ["$availableStock", "$minStock"] };
    }
    let docs = await InventoryStock_1.InventoryStock.find(query)
        .populate("productId", "name category")
        .populate("warehouseId", "name city")
        .populate("vendorId", "businessName")
        .lean();
    // Text search applied post-populate
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((d) => {
            const product = d.productId;
            return (d.sku.toLowerCase().includes(q) ||
                d.variantId.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                d.vendorId?.businessName?.toLowerCase().includes(q) ||
                d.batchNumber.toLowerCase().includes(q));
        });
    }
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getStockLedger = getStockLedger;
// =====================================================
// ADD INBOUND STOCK
// =====================================================
const addStock = async (payload) => {
    const { productId, variantId, warehouseId, vendorId, sku = "", unitCode = "pcs", quantity, batchNumber = "", notes = "", referenceId = "", location = "", createdBy, } = payload;
    // Find or create InventoryStock record
    let stock = await InventoryStock_1.InventoryStock.findOne({ productId, variantId, warehouseId });
    if (!stock) {
        stock = await InventoryStock_1.InventoryStock.create({
            productId: new mongoose_1.Types.ObjectId(productId),
            variantId,
            warehouseId: new mongoose_1.Types.ObjectId(warehouseId),
            vendorId: vendorId ? new mongoose_1.Types.ObjectId(vendorId) : undefined,
            sku,
            unitCode,
            batchNumber,
            availableStock: 0,
            reservedStock: 0,
            inTransitStock: 0,
            damagedStock: 0,
            expiredStock: 0,
        });
    }
    const previousStock = stock.availableStock;
    stock.availableStock += quantity;
    if (batchNumber)
        stock.batchNumber = batchNumber;
    await stock.save();
    // Create ledger entry
    const movementId = generateMovementId();
    const movement = await StockMovement_1.StockMovement.create({
        movementId,
        productId: new mongoose_1.Types.ObjectId(productId),
        variantId,
        warehouseId: new mongoose_1.Types.ObjectId(warehouseId),
        vendorId: vendorId ? new mongoose_1.Types.ObjectId(vendorId) : undefined,
        movementType: "Purchase",
        referenceId,
        quantity,
        previousStock,
        newStock: stock.availableStock,
        batchNumber,
        location,
        notes,
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return { stock, movement };
};
exports.addStock = addStock;
// =====================================================
// STOCK ADJUSTMENT
// =====================================================
const adjustStock = async (payload) => {
    const { productId, variantId, warehouseId, adjustmentType, quantity, reason, notes, batchNumber = "", createdBy, } = payload;
    const stock = await InventoryStock_1.InventoryStock.findOne({ productId, variantId, warehouseId });
    if (!stock) {
        throw new AppError_1.AppError("Inventory record not found for this variant and warehouse", httpStatusCodes_1.default.NOT_FOUND);
    }
    const previousStock = stock.availableStock;
    let movementType;
    let newAvailable = stock.availableStock;
    let quantityDelta = quantity;
    switch (adjustmentType) {
        case "Increase":
            newAvailable = stock.availableStock + quantity;
            movementType = "Manual Addition";
            break;
        case "Decrease":
            if (quantity > stock.availableStock) {
                throw new AppError_1.AppError(`Cannot decrease by ${quantity} — only ${stock.availableStock} units available (Zero Negative Stock Rule)`, httpStatusCodes_1.default.BAD_REQUEST);
            }
            newAvailable = stock.availableStock - quantity;
            quantityDelta = -quantity;
            movementType = "Manual Deduction";
            break;
        case "Damage":
            if (quantity > stock.availableStock) {
                throw new AppError_1.AppError(`Cannot mark ${quantity} as damaged — only ${stock.availableStock} units available`, httpStatusCodes_1.default.BAD_REQUEST);
            }
            newAvailable = stock.availableStock - quantity;
            stock.damagedStock += quantity;
            quantityDelta = -quantity;
            movementType = "Damage";
            break;
        case "Expiry":
            if (quantity > stock.availableStock) {
                throw new AppError_1.AppError(`Cannot mark ${quantity} as expired — only ${stock.availableStock} units available`, httpStatusCodes_1.default.BAD_REQUEST);
            }
            newAvailable = stock.availableStock - quantity;
            stock.expiredStock += quantity;
            quantityDelta = -quantity;
            movementType = "Expiry";
            break;
        default:
            throw new AppError_1.AppError("Invalid adjustment type", httpStatusCodes_1.default.BAD_REQUEST);
    }
    stock.availableStock = newAvailable;
    await stock.save();
    const movementId = generateMovementId();
    const movement = await StockMovement_1.StockMovement.create({
        movementId,
        productId: new mongoose_1.Types.ObjectId(productId),
        variantId,
        warehouseId: new mongoose_1.Types.ObjectId(warehouseId),
        vendorId: stock.vendorId,
        movementType,
        referenceId: "",
        quantity: quantityDelta,
        previousStock,
        newStock: newAvailable,
        batchNumber,
        location: "",
        notes: `[${reason}] ${notes}`.trim(),
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
    });
    return { stock, movement };
};
exports.adjustStock = adjustStock;
// =====================================================
// LOW STOCK ALERTS
// =====================================================
const getLowStockItems = async (filters) => {
    const { search, vendorId, warehouseId, page = 1, limit = 20 } = filters;
    const query = {
        softDeleted: false,
        $expr: { $and: [{ $lte: ["$availableStock", "$minStock"] }, { $gt: ["$availableStock", 0] }] },
    };
    if (vendorId && mongoose_1.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose_1.Types.ObjectId(vendorId);
    }
    if (warehouseId && mongoose_1.Types.ObjectId.isValid(warehouseId)) {
        query.warehouseId = new mongoose_1.Types.ObjectId(warehouseId);
    }
    let docs = await InventoryStock_1.InventoryStock.find(query)
        .populate("productId", "name category")
        .populate("warehouseId", "name city")
        .populate("vendorId", "businessName")
        .lean();
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((d) => {
            const product = d.productId;
            return (d.sku.toLowerCase().includes(q) ||
                d.variantId.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                d.vendorId?.businessName?.toLowerCase().includes(q));
        });
    }
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getLowStockItems = getLowStockItems;
// =====================================================
// OUT OF STOCK
// =====================================================
const getOutOfStockItems = async (filters) => {
    const { search, vendorId, page = 1, limit = 20 } = filters;
    const query = { softDeleted: false, availableStock: 0 };
    if (vendorId && mongoose_1.Types.ObjectId.isValid(vendorId)) {
        query.vendorId = new mongoose_1.Types.ObjectId(vendorId);
    }
    let docs = await InventoryStock_1.InventoryStock.find(query)
        .populate("productId", "name category")
        .populate("warehouseId", "name city")
        .populate("vendorId", "businessName")
        .lean();
    if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((d) => {
            const product = d.productId;
            return (d.sku.toLowerCase().includes(q) ||
                d.variantId.toLowerCase().includes(q) ||
                (product?.name || "").toLowerCase().includes(q) ||
                d.vendorId?.businessName?.toLowerCase().includes(q));
        });
    }
    // Stats for overview cards
    const totalOutOfStockSkus = docs.length;
    const backorderUnits = docs.reduce((s, d) => s + d.reservedStock, 0);
    const vendorIds = new Set(docs.map((d) => String(d.vendorId)));
    const vendorsImpacted = vendorIds.size;
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);
    return {
        stats: { totalOutOfStockSkus, backorderUnits, vendorsImpacted },
        data: paginated,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
};
exports.getOutOfStockItems = getOutOfStockItems;
//# sourceMappingURL=inventory.service.js.map