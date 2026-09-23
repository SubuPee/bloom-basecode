import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  validateAddStock,
  validateStockAdjustment,
} from "../../validations/inventory/inventory.validation";
import {
  getInventoryOverview,
  getStockLedger,
  addStock,
  adjustStock,
  getLowStockItems,
  getOutOfStockItems,
} from "../../services/inventory/inventory.service";
import { getAdjustmentHistory } from "../../services/inventory/stockMovement.service";

// =====================================================
// GET /api/inventory/overview
// =====================================================
export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await getInventoryOverview();
  return sendSuccess(res, data, "Inventory overview retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/inventory/stock
// =====================================================
export const stockLedger = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, vendorId, warehouseId, status,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getStockLedger({
    search,
    vendorId,
    warehouseId,
    status,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Stock ledger retrieved", httpStatusCodes.OK);
});

// =====================================================
// POST /api/inventory/stock/add
// =====================================================
export const addInboundStock = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateAddStock(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const result = await addStock({ ...req.body, createdBy: String(createdBy) });
  return sendSuccess(res, result, "Stock added successfully", httpStatusCodes.CREATED);
});

// =====================================================
// POST /api/inventory/stock/adjust
// =====================================================
export const adjustInventoryStock = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateStockAdjustment(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const result = await adjustStock({ ...req.body, createdBy: String(createdBy) });
  return sendSuccess(res, result, "Stock adjustment applied", httpStatusCodes.OK);
});

// =====================================================
// GET /api/inventory/stock/adjust  (recent adjustments)
// =====================================================
export const adjustmentHistory = asyncHandler(async (req: Request, res: Response) => {
  const { page = "1", limit = "30" } = req.query as Record<string, string>;
  const result = await getAdjustmentHistory({ page: parseInt(page), limit: parseInt(limit) });
  return sendSuccess(res, result, "Adjustment history retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/inventory/low-stock
// =====================================================
export const lowStock = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, vendorId, warehouseId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getLowStockItems({
    search, vendorId, warehouseId,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Low stock items retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/inventory/out-of-stock
// =====================================================
export const outOfStock = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, vendorId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getOutOfStockItems({
    search, vendorId,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Out of stock items retrieved", httpStatusCodes.OK);
});
