import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  validateCreateOrder,
  validateCompleteOrder,
  validateCancelOrder,
} from "../../validations/production/production.validation";
import {
  getProductionOverview,
  getOrders,
  getOrderById,
  createOrder,
  startOrder,
  completeOrder,
  cancelOrder,
  getProductionHistory,
} from "../../services/production/production.service";

// =====================================================
// GET /api/production/overview
// =====================================================
export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await getProductionOverview();
  return sendSuccess(res, data, "Production overview retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/production/orders
// =====================================================
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, status, vendorId,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getOrders({
    search, status, vendorId,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Production orders retrieved", httpStatusCodes.OK);
});

// =====================================================
// GET /api/production/orders/:id
// =====================================================
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const result = await getOrderById(orderId);
  return sendSuccess(res, result, "Production order retrieved", httpStatusCodes.OK);
});

// =====================================================
// POST /api/production/orders
// =====================================================
export const create = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateCreateOrder(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const order = await createOrder({ ...req.body, createdBy: String(createdBy) });
  return sendSuccess(res, order, "Production order scheduled", httpStatusCodes.CREATED);
});

// =====================================================
// PATCH /api/production/orders/:id/start
// =====================================================
export const start = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const order = await startOrder(orderId);
  return sendSuccess(res, order, "Production order started", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/production/orders/:id/complete
// =====================================================
export const complete = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const errors = validateCompleteOrder(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const createdBy = (req as any).user?._id || (req as any).user?.id;
  if (!createdBy) {
    return sendError(res, "Unauthorized", httpStatusCodes.UNAUTHORIZED);
  }

  const { producedQuantity, rejectedQuantity } = req.body;
  const result = await completeOrder(
    orderId,
    Number(producedQuantity),
    Number(rejectedQuantity),
    String(createdBy)
  );

  return sendSuccess(res, result, "Production completed and inventory inwarded", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/production/orders/:id/cancel
// =====================================================
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.id as string;
  const errors = validateCancelOrder(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const order = await cancelOrder(orderId, req.body.cancelReason);
  return sendSuccess(res, order, "Production order cancelled", httpStatusCodes.OK);
});

// =====================================================
// GET /api/production/history
// =====================================================
export const history = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, vendorId, dateFrom, dateTo,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getProductionHistory({
    search, vendorId, dateFrom, dateTo,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Production history retrieved", httpStatusCodes.OK);
});
