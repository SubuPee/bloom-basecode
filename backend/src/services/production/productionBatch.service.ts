import { Types } from "mongoose";
import { ProductionBatch, BatchStatus } from "../../models/production/ProductionBatch";
import { AppError } from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// =====================================================
// PRODUCTION BATCH SERVICE — Batch queries
// =====================================================

export const getBatches = async (filters: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, status, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {};
  if (status && status !== "All") query.status = status;

  let docs = await ProductionBatch.find(query)
    .sort({ createdAt: -1 })
    .populate("productId", "name category")
    .populate("vendorId", "businessName")
    .populate("warehouseId", "name city")
    .populate("productionOrderId", "orderId status")
    .lean();

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter((b) => {
      const product = b.productId as any;
      const vendor = b.vendorId as any;
      return (
        b.batchNumber.toLowerCase().includes(q) ||
        b.variantId.toLowerCase().includes(q) ||
        (product?.name || "").toLowerCase().includes(q) ||
        (vendor?.businessName || "").toLowerCase().includes(q)
      );
    });
  }

  const total = docs.length;
  const paginated = docs.slice((page - 1) * limit, page * limit);

  // Stats for cards
  const allBatches = await ProductionBatch.find().lean();
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

export const updateBatchStatus = async (idOrBatchNumber: string, status: BatchStatus) => {
  const query = Types.ObjectId.isValid(idOrBatchNumber)
    ? { $or: [{ _id: idOrBatchNumber }, { batchNumber: idOrBatchNumber }] }
    : { batchNumber: idOrBatchNumber };

  const batch = await ProductionBatch.findOne(query);
  if (!batch) {
    throw new AppError("Production batch not found", httpStatusCodes.NOT_FOUND);
  }

  batch.status = status;
  await batch.save();
  return batch;
};
