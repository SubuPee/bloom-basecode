import { StockMovement, MovementType } from "../../models/inventory/StockMovement";

// =====================================================
// STOCK MOVEMENT SERVICE — Ledger reads
// =====================================================

const ADJUSTMENT_TYPES: MovementType[] = [
  "Adjustment",
  "Damage",
  "Expiry",
  "Manual Addition",
  "Manual Deduction",
];

export const getMovements = async (filters: {
  search?: string;
  movementType?: string;
  vendorId?: string;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  const {
    search, movementType, vendorId, warehouseId,
    dateFrom, dateTo, page = 1, limit = 30,
  } = filters;

  const query: Record<string, any> = {};

  if (movementType && movementType !== "All") {
    query.movementType = movementType;
  }
  if (vendorId) query.vendorId = vendorId;
  if (warehouseId) query.warehouseId = warehouseId;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo + "T23:59:59Z");
  }

  let docs = await StockMovement.find(query)
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
      const product = m.productId as any;
      const vendor = m.vendorId as any;
      return (
        m.movementId.toLowerCase().includes(q) ||
        m.referenceId.toLowerCase().includes(q) ||
        m.variantId.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (vendor?.businessName || "").toLowerCase().includes(q) ||
        (m.notes || "").toLowerCase().includes(q)
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

export const getAuditHistory = async (filters: {
  search?: string;
  movementType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  // History is movements with optional date-range filter — full audit trail
  return getMovements(filters);
};

export const getAdjustmentHistory = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 30 } = filters;

  const docs = await StockMovement.find({ movementType: { $in: ADJUSTMENT_TYPES } })
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
