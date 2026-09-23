import { Types } from "mongoose";
import { InventoryStock } from "../../models/inventory/InventoryStock";
import { StockMovement } from "../../models/inventory/StockMovement";
import { StockTransfer } from "../../models/inventory/StockTransfer";
import { AppError } from "../../errors/AppError";
import httpStatusCodes from "../../constants/httpStatusCodes";

// =====================================================
// ID GENERATOR
// =====================================================

const generateTransferId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRF-${suffix}`;
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
// CREATE TRANSFER (Phase 1)
// Deduct from source availableStock → add to destination inTransitStock
// =====================================================

export const createTransfer = async (payload: {
  productId: string;
  variantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  batchNumber?: string;
  notes?: string;
  createdBy: string;
}) => {
  const {
    productId, variantId, fromWarehouseId, toWarehouseId,
    quantity, batchNumber = "", notes = "", createdBy,
  } = payload;

  // Verify source stock exists and has enough
  const sourceStock = await InventoryStock.findOne({
    productId, variantId, warehouseId: fromWarehouseId,
  });

  if (!sourceStock) {
    throw new AppError(
      "No inventory record found at source warehouse for this variant",
      httpStatusCodes.NOT_FOUND
    );
  }
  if (sourceStock.availableStock < quantity) {
    throw new AppError(
      `Insufficient available stock at source. Available: ${sourceStock.availableStock}, requested: ${quantity}`,
      httpStatusCodes.BAD_REQUEST
    );
  }

  // Deduct from source
  const sourcePrev = sourceStock.availableStock;
  sourceStock.availableStock -= quantity;
  await sourceStock.save();

  // Find or create destination stock record
  let destStock = await InventoryStock.findOne({
    productId, variantId, warehouseId: toWarehouseId,
  });

  if (!destStock) {
    destStock = await InventoryStock.create({
      productId: new Types.ObjectId(productId),
      variantId,
      warehouseId: new Types.ObjectId(toWarehouseId),
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
  const transfer = await StockTransfer.create({
    transferId,
    productId: new Types.ObjectId(productId),
    variantId,
    fromWarehouseId: new Types.ObjectId(fromWarehouseId),
    toWarehouseId: new Types.ObjectId(toWarehouseId),
    quantity,
    status: "In Transit",
    batchNumber,
    notes,
    dispatchedAt: new Date(),
    createdBy: new Types.ObjectId(createdBy),
  });

  // Ledger: Transfer Out (source)
  await StockMovement.create({
    movementId: generateMovementId(),
    productId: new Types.ObjectId(productId),
    variantId,
    warehouseId: new Types.ObjectId(fromWarehouseId),
    vendorId: sourceStock.vendorId,
    movementType: "Transfer Out",
    referenceId: transferId,
    quantity: -quantity,
    previousStock: sourcePrev,
    newStock: sourceStock.availableStock,
    batchNumber,
    location: "",
    notes: `Transfer to warehouse ${toWarehouseId}. ${notes}`.trim(),
    createdBy: new Types.ObjectId(createdBy),
  });

  return { transfer, sourceStock, destStock };
};

// =====================================================
// RECEIVE TRANSFER (Phase 2)
// Convert destination inTransitStock → availableStock
// =====================================================

export const receiveTransfer = async (transferId: string, createdBy: string) => {
  const transfer = await StockTransfer.findOne({ transferId });
  if (!transfer) {
    throw new AppError("Transfer not found", httpStatusCodes.NOT_FOUND);
  }
  if (transfer.status !== "In Transit") {
    throw new AppError(
      `Transfer cannot be received — current status is '${transfer.status}'`,
      httpStatusCodes.BAD_REQUEST
    );
  }

  const destStock = await InventoryStock.findOne({
    productId: transfer.productId,
    variantId: transfer.variantId,
    warehouseId: transfer.toWarehouseId,
  });

  if (!destStock) {
    throw new AppError("Destination inventory record not found", httpStatusCodes.NOT_FOUND);
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
  await StockMovement.create({
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
    createdBy: new Types.ObjectId(createdBy),
  });

  return { transfer, destStock };
};

// =====================================================
// CANCEL TRANSFER
// Reverse the source deduction
// =====================================================

export const cancelTransfer = async (
  transferId: string,
  cancelReason: string,
  createdBy: string
) => {
  const transfer = await StockTransfer.findOne({ transferId });
  if (!transfer) {
    throw new AppError("Transfer not found", httpStatusCodes.NOT_FOUND);
  }
  if (transfer.status !== "In Transit" && transfer.status !== "Pending") {
    throw new AppError(
      `Transfer cannot be cancelled — current status is '${transfer.status}'`,
      httpStatusCodes.BAD_REQUEST
    );
  }

  // Restore source availableStock
  const sourceStock = await InventoryStock.findOne({
    productId: transfer.productId,
    variantId: transfer.variantId,
    warehouseId: transfer.fromWarehouseId,
  });

  if (sourceStock) {
    const prev = sourceStock.availableStock;
    sourceStock.availableStock += transfer.quantity;
    await sourceStock.save();

    await StockMovement.create({
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
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  // Clear destination inTransitStock
  const destStock = await InventoryStock.findOne({
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

// =====================================================
// LIST TRANSFERS
// =====================================================

export const getTransfers = async (filters: {
  status?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, fromWarehouseId, toWarehouseId, page = 1, limit = 20 } = filters;

  const query: Record<string, any> = {};
  if (status && status !== "All") query.status = status;
  if (fromWarehouseId) query.fromWarehouseId = new Types.ObjectId(fromWarehouseId);
  if (toWarehouseId) query.toWarehouseId = new Types.ObjectId(toWarehouseId);

  const [total, docs] = await Promise.all([
    StockTransfer.countDocuments(query),
    StockTransfer.find(query)
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
