import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getMovements,
  getAuditHistory,
} from "../../services/inventory/stockMovement.service";

// =====================================================
// GET /api/inventory/movements
// =====================================================
export const movementsLedger = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, movementType, vendorId, warehouseId,
    dateFrom, dateTo,
    page = "1", limit = "30",
  } = req.query as Record<string, string>;

  const result = await getMovements({
    search, movementType, vendorId, warehouseId,
    dateFrom, dateTo,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Stock movement ledger retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/inventory/history
// =====================================================
export const auditHistory = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, movementType,
    dateFrom, dateTo,
    page = "1", limit = "30",
  } = req.query as Record<string, string>;

  const result = await getAuditHistory({
    search, movementType,
    dateFrom, dateTo,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Stock audit history retrieved", httpStatusCodes.OK);
});
