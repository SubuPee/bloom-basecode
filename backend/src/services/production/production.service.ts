import { Types } from "mongoose";
import { ProductionOrder, ProductionStatus } from "../../models/production/ProductionOrder";
import { ProductionBatch } from "../../models/production/ProductionBatch";
import { InventoryStock } from "../../models/inventory/InventoryStock";
import { StockMovement } from "../../models/inventory/StockMovement";
import { AppError } from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// =====================================================
// ID GENERATORS
// =====================================================

const generateOrderId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRD-${suffix}`;
};

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

export const getProductionOverview = async () => {
  const allOrders = await ProductionOrder.find()
    .populate("productId", "name category")
    .populate("vendorId", "businessName")
    .populate("warehouseId", "name city")
    .lean();

  const totalOrders = allOrders.length;
  const activeOrders = allOrders.filter(
    (o) => o.status === "Planned" || o.status === "In Progress" || o.status === "Partially Completed"
  );
  const completedOrders = allOrders.filter((o) => o.status === "Completed");
  const cancelledOrders = allOrders.filter((o) => o.status === "Cancelled");

  const totalProduced = allOrders.reduce((s, o) => s + o.producedQuantity, 0);
  const totalGood = allOrders.reduce((s, o) => s + o.goodQuantity, 0);
  const totalRejected = allOrders.reduce((s, o) => s + o.rejectedQuantity, 0);
  const yieldPercentage = totalProduced > 0
    ? Math.round((totalGood / totalProduced) * 100)
    : 100;

  // Recent batches for sidebar
  const recentBatches = await ProductionBatch.find()
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

// =====================================================
// LIST ORDERS (with filters)
// =====================================================

export const getOrders = async (filters: {
  search?: string;
  status?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, status, vendorId, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {};
  if (status && status !== "All") query.status = status;
  if (vendorId) query.vendorId = new Types.ObjectId(vendorId);

  let docs = await ProductionOrder.find(query)
    .sort({ createdAt: -1 })
    .populate("productId", "name category")
    .populate("vendorId", "businessName")
    .populate("warehouseId", "name city")
    .populate("createdBy", "name email")
    .lean();

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((o) => {
      const product = o.productId as any;
      const vendor = o.vendorId as any;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.batchNumber.toLowerCase().includes(q) ||
        o.variantId.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (vendor?.businessName || "").toLowerCase().includes(q)
      );
    });
  }

  const allOrders = await ProductionOrder.find().lean();
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

const buildOrderQuery = (id: string) => {
  return Types.ObjectId.isValid(id) ? { $or: [{ orderId: id }, { _id: id }] } : { orderId: id };
};

// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getOrderById = async (orderId: string) => {
  const order = await ProductionOrder.findOne(buildOrderQuery(orderId))
    .populate("productId", "name category")
    .populate("vendorId", "businessName ownerName")
    .populate("warehouseId", "name city")
    .populate("createdBy", "name email")
    .lean();

  if (!order) {
    throw new AppError("Production order not found", httpStatusCodes.NOT_FOUND);
  }

  // Find related batch if exists
  const relatedBatch = await ProductionBatch.findOne({ batchNumber: order.batchNumber })
    .populate("warehouseId", "name")
    .lean();

  return { order, relatedBatch };
};

// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = async (payload: {
  productId: string;
  variantId: string;
  vendorId: string;
  batchNumber: string;
  plannedQuantity: number;
  unit: string;
  warehouseId: string;
  storageLocation?: string;
  expectedCompletion: string;
  notes?: string;
  rawMaterials?: Array<{ name: string; requiredQuantity: number; unit: string; availableStock?: number }>;
  createdBy: string;
}) => {
  const {
    productId, variantId, vendorId, batchNumber, plannedQuantity,
    unit, warehouseId, storageLocation = "", expectedCompletion,
    notes = "", rawMaterials = [], createdBy,
  } = payload;

  const orderId = generateOrderId();

  const order = await ProductionOrder.create({
    orderId,
    productId: new Types.ObjectId(productId),
    variantId,
    vendorId: new Types.ObjectId(vendorId),
    batchNumber,
    plannedQuantity,
    producedQuantity: 0,
    goodQuantity: 0,
    rejectedQuantity: 0,
    unit,
    status: "Planned" as ProductionStatus,
    warehouseId: new Types.ObjectId(warehouseId),
    storageLocation,
    expectedCompletion: new Date(expectedCompletion),
    notes,
    rawMaterials,
    createdBy: new Types.ObjectId(createdBy),
  });

  return order;
};

// =====================================================
// START ORDER (Planned → In Progress)
// =====================================================

export const startOrder = async (orderId: string) => {
  const order = await ProductionOrder.findOne(buildOrderQuery(orderId));
  if (!order) {
    throw new AppError("Production order not found", httpStatusCodes.NOT_FOUND);
  }
  if (order.status !== "Planned") {
    throw new AppError(
      `Order cannot be started — current status is '${order.status}'. Only 'Planned' orders can be started.`,
      httpStatusCodes.BAD_REQUEST
    );
  }

  order.status = "In Progress";
  order.startedAt = new Date();
  await order.save();

  return order;
};

// =====================================================
// COMPLETE ORDER — QA Output + Inventory Inwarding
// =====================================================

export const completeOrder = async (
  orderId: string,
  producedQuantity: number,
  rejectedQuantity: number,
  createdBy: string
) => {
  const order = await ProductionOrder.findOne(buildOrderQuery(orderId));
  if (!order) {
    throw new AppError("Production order not found", httpStatusCodes.NOT_FOUND);
  }
  if (order.status !== "In Progress" && order.status !== "Planned") {
    throw new AppError(
      `Order cannot be completed — current status is '${order.status}'`,
      httpStatusCodes.BAD_REQUEST
    );
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
  let stock = await InventoryStock.findOne({
    productId: order.productId,
    variantId: order.variantId,
    warehouseId: order.warehouseId,
  });

  if (!stock) {
    stock = await InventoryStock.create({
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

    await StockMovement.create({
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
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  // Inward rejected units → damagedStock
  if (rejectedQuantity > 0) {
    const prevDamaged = stock.damagedStock;
    stock.damagedStock += rejectedQuantity;

    await StockMovement.create({
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
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  await stock.save();

  // ----- AUTO-CREATE PRODUCTION BATCH -----
  const batch = await ProductionBatch.create({
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
    createdBy: new Types.ObjectId(createdBy),
  });

  return { order, stock, batch };
};

// =====================================================
// CANCEL ORDER
// =====================================================

export const cancelOrder = async (orderId: string, cancelReason: string) => {
  const order = await ProductionOrder.findOne(buildOrderQuery(orderId));
  if (!order) {
    throw new AppError("Production order not found", httpStatusCodes.NOT_FOUND);
  }
  if (order.status !== "Planned" && order.status !== "In Progress") {
    throw new AppError(
      `Order cannot be cancelled — current status is '${order.status}'`,
      httpStatusCodes.BAD_REQUEST
    );
  }

  order.status = "Cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = cancelReason;
  await order.save();

  return order;
};

// =====================================================
// PRODUCTION HISTORY (completed + cancelled)
// =====================================================

export const getProductionHistory = async (filters: {
  search?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, vendorId, dateFrom, dateTo, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {
    status: { $in: ["Completed", "Partially Completed", "Cancelled"] },
  };

  if (vendorId) query.vendorId = new Types.ObjectId(vendorId);
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo + "T23:59:59Z");
  }

  let docs = await ProductionOrder.find(query)
    .sort({ completedAt: -1, cancelledAt: -1, createdAt: -1 })
    .populate("productId", "name category")
    .populate("vendorId", "businessName")
    .populate("warehouseId", "name city")
    .populate("createdBy", "name email")
    .lean();

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((o) => {
      const product = o.productId as any;
      const vendor = o.vendorId as any;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.batchNumber.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (vendor?.businessName || "").toLowerCase().includes(q)
      );
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
