import { Types } from "mongoose";
import { InventoryStock } from "../../models/inventory/InventoryStock";
import { StockMovement, MovementType } from "../../models/inventory/StockMovement";
import { AppError } from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// =====================================================
// ID GENERATOR
// =====================================================

const generateMovementId = (): string => {
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

export const getInventoryOverview = async () => {
  const stocks = await InventoryStock.find({ softDeleted: false })
    .populate("productId", "name category")
    .populate("warehouseId", "name")
    .lean();

  const availableStock = stocks.reduce((s, r) => s + r.availableStock, 0);
  const reservedStock = stocks.reduce((s, r) => s + r.reservedStock, 0);
  const inTransitStock = stocks.reduce((s, r) => s + r.inTransitStock, 0);
  const damagedStock = stocks.reduce((s, r) => s + r.damagedStock, 0);
  const expiredStock = stocks.reduce((s, r) => s + r.expiredStock, 0);

  // Category breakdown for bar chart
  const categoryMap: Record<string, { available: number; reserved: number }> = {};
  for (const s of stocks) {
    const product = s.productId as any;
    const cat = product?.category || "Uncategorised";
    if (!categoryMap[cat]) categoryMap[cat] = { available: 0, reserved: 0 };
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
  const recentMovements = await StockMovement.find()
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

// =====================================================
// PRODUCT STOCK LEDGER
// =====================================================

export const getStockLedger = async (filters: {
  search?: string;
  vendorId?: string;
  warehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, vendorId, warehouseId, status, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = { softDeleted: false };

  if (vendorId && Types.ObjectId.isValid(vendorId)) {
    query.vendorId = new Types.ObjectId(vendorId);
  }
  if (warehouseId && Types.ObjectId.isValid(warehouseId)) {
    query.warehouseId = new Types.ObjectId(warehouseId);
  }
  if (status === "Out of Stock") {
    query.availableStock = 0;
  } else if (status === "Low Stock") {
    query.$expr = { $and: [{ $lte: ["$availableStock", "$minStock"] }, { $gt: ["$availableStock", 0] }] };
  } else if (status === "In Stock") {
    query.$expr = { $gt: ["$availableStock", "$minStock"] };
  }

  let docs = await InventoryStock.find(query)
    .populate("productId", "name category")
    .populate("warehouseId", "name city")
    .populate("vendorId", "businessName")
    .lean();

  // Text search applied post-populate
  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((d) => {
      const product = d.productId as any;
      return (
        d.sku.toLowerCase().includes(q) ||
        d.variantId.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (d.vendorId as any)?.businessName?.toLowerCase().includes(q) ||
        d.batchNumber.toLowerCase().includes(q)
      );
    });
  }

  const total = docs.length;
  const paginated = docs.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

// =====================================================
// ADD INBOUND STOCK
// =====================================================

export const addStock = async (payload: {
  productId: string;
  variantId: string;
  warehouseId: string;
  vendorId?: string;
  sku?: string;
  unitCode?: string;
  quantity: number;
  batchNumber?: string;
  notes?: string;
  referenceId?: string;
  location?: string;
  createdBy: string;
}) => {
  const {
    productId, variantId, warehouseId, vendorId, sku = "",
    unitCode = "pcs", quantity, batchNumber = "", notes = "",
    referenceId = "", location = "", createdBy,
  } = payload;

  // Find or create InventoryStock record
  let stock = await InventoryStock.findOne({ productId, variantId, warehouseId });

  if (!stock) {
    stock = await InventoryStock.create({
      productId: new Types.ObjectId(productId),
      variantId,
      warehouseId: new Types.ObjectId(warehouseId),
      vendorId: vendorId ? new Types.ObjectId(vendorId) : undefined,
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
  if (batchNumber) stock.batchNumber = batchNumber;
  await stock.save();

  // Create ledger entry
  const movementId = generateMovementId();
  const movement = await StockMovement.create({
    movementId,
    productId: new Types.ObjectId(productId),
    variantId,
    warehouseId: new Types.ObjectId(warehouseId),
    vendorId: vendorId ? new Types.ObjectId(vendorId) : undefined,
    movementType: "Purchase" as MovementType,
    referenceId,
    quantity,
    previousStock,
    newStock: stock.availableStock,
    batchNumber,
    location,
    notes,
    createdBy: new Types.ObjectId(createdBy),
  });

  return { stock, movement };
};

// =====================================================
// STOCK ADJUSTMENT
// =====================================================

export const adjustStock = async (payload: {
  productId: string;
  variantId: string;
  warehouseId: string;
  adjustmentType: "Increase" | "Decrease" | "Damage" | "Expiry";
  quantity: number;
  reason: string;
  notes: string;
  batchNumber?: string;
  createdBy: string;
}) => {
  const {
    productId, variantId, warehouseId, adjustmentType,
    quantity, reason, notes, batchNumber = "", createdBy,
  } = payload;

  const stock = await InventoryStock.findOne({ productId, variantId, warehouseId });
  if (!stock) {
    throw new AppError(
      "Inventory record not found for this variant and warehouse",
      httpStatusCodes.NOT_FOUND
    );
  }

  const previousStock = stock.availableStock;
  let movementType: MovementType;
  let newAvailable = stock.availableStock;
  let quantityDelta = quantity;

  switch (adjustmentType) {
    case "Increase":
      newAvailable = stock.availableStock + quantity;
      movementType = "Manual Addition";
      break;

    case "Decrease":
      if (quantity > stock.availableStock) {
        throw new AppError(
          `Cannot decrease by ${quantity} — only ${stock.availableStock} units available (Zero Negative Stock Rule)`,
          httpStatusCodes.BAD_REQUEST
        );
      }
      newAvailable = stock.availableStock - quantity;
      quantityDelta = -quantity;
      movementType = "Manual Deduction";
      break;

    case "Damage":
      if (quantity > stock.availableStock) {
        throw new AppError(
          `Cannot mark ${quantity} as damaged — only ${stock.availableStock} units available`,
          httpStatusCodes.BAD_REQUEST
        );
      }
      newAvailable = stock.availableStock - quantity;
      stock.damagedStock += quantity;
      quantityDelta = -quantity;
      movementType = "Damage";
      break;

    case "Expiry":
      if (quantity > stock.availableStock) {
        throw new AppError(
          `Cannot mark ${quantity} as expired — only ${stock.availableStock} units available`,
          httpStatusCodes.BAD_REQUEST
        );
      }
      newAvailable = stock.availableStock - quantity;
      stock.expiredStock += quantity;
      quantityDelta = -quantity;
      movementType = "Expiry";
      break;

    default:
      throw new AppError("Invalid adjustment type", httpStatusCodes.BAD_REQUEST);
  }

  stock.availableStock = newAvailable;
  await stock.save();

  const movementId = generateMovementId();
  const movement = await StockMovement.create({
    movementId,
    productId: new Types.ObjectId(productId),
    variantId,
    warehouseId: new Types.ObjectId(warehouseId),
    vendorId: stock.vendorId,
    movementType,
    referenceId: "",
    quantity: quantityDelta,
    previousStock,
    newStock: newAvailable,
    batchNumber,
    location: "",
    notes: `[${reason}] ${notes}`.trim(),
    createdBy: new Types.ObjectId(createdBy),
  });

  return { stock, movement };
};

// =====================================================
// LOW STOCK ALERTS
// =====================================================

export const getLowStockItems = async (filters: {
  search?: string;
  vendorId?: string;
  warehouseId?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, vendorId, warehouseId, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {
    softDeleted: false,
    $expr: { $and: [{ $lte: ["$availableStock", "$minStock"] }, { $gt: ["$availableStock", 0] }] },
  };

  if (vendorId && Types.ObjectId.isValid(vendorId)) {
    query.vendorId = new Types.ObjectId(vendorId);
  }
  if (warehouseId && Types.ObjectId.isValid(warehouseId)) {
    query.warehouseId = new Types.ObjectId(warehouseId);
  }

  let docs = await InventoryStock.find(query)
    .populate("productId", "name category")
    .populate("warehouseId", "name city")
    .populate("vendorId", "businessName")
    .lean();

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((d) => {
      const product = d.productId as any;
      return (
        d.sku.toLowerCase().includes(q) ||
        d.variantId.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (d.vendorId as any)?.businessName?.toLowerCase().includes(q)
      );
    });
  }

  const total = docs.length;
  const paginated = docs.slice((page - 1) * limit, page * limit);

  return {
    data: paginated,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

// =====================================================
// OUT OF STOCK
// =====================================================

export const getOutOfStockItems = async (filters: {
  search?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, vendorId, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = { softDeleted: false, availableStock: 0 };

  if (vendorId && Types.ObjectId.isValid(vendorId)) {
    query.vendorId = new Types.ObjectId(vendorId);
  }

  let docs = await InventoryStock.find(query)
    .populate("productId", "name category")
    .populate("warehouseId", "name city")
    .populate("vendorId", "businessName")
    .lean();

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((d) => {
      const product = d.productId as any;
      return (
        d.sku.toLowerCase().includes(q) ||
        d.variantId.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (d.vendorId as any)?.businessName?.toLowerCase().includes(q)
      );
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
