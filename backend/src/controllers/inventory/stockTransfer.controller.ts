import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  validateCreateTransfer,
  validateCancelTransfer,
} from "../../validations/inventory/stockTransfer.validation";
import {
  createTransfer,
  receiveTransfer,
  cancelTransfer,
  getTransfers,
} from "../../services/inventory/stockTransfer.service";

// =====================================================
// POST /api/inventory/transfers
// =====================================================
export const initTransfer = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateCreateTransfer(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const result = await createTransfer({ ...req.body, createdBy: String(createdBy) });
  return sendSuccess(res, result, "Stock transfer initiated", httpStatusCodes.CREATED);
});

// =====================================================
// GET /api/inventory/transfers
// =====================================================
export const listTransfers = asyncHandler(async (req: Request, res: Response) => {
  const {
    status, fromWarehouseId, toWarehouseId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getTransfers({
    status, fromWarehouseId, toWarehouseId,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Transfers retrieved", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/inventory/transfers/:id/receive
// =====================================================
export const confirmReceive = asyncHandler(async (req: Request, res: Response) => {
  const transferId = req.params.id as string;
  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const result = await receiveTransfer(transferId, String(createdBy));
  return sendSuccess(res, result, "Transfer received and stock updated", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/inventory/transfers/:id/cancel
// =====================================================
export const cancelTransferHandler = asyncHandler(async (req: Request, res: Response) => {
  const transferId = req.params.id as string;
  const errors = validateCancelTransfer(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const result = await cancelTransfer(transferId, req.body.cancelReason, String(createdBy));
  return sendSuccess(res, result, "Transfer cancelled and stock reversed", httpStatusCodes.OK);
});
