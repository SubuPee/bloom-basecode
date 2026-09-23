import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import { getBatches, updateBatchStatus } from "../../services/production/productionBatch.service";

// =====================================================
// GET /api/production/batches
// =====================================================
export const listBatches = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, status,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getBatches({
    search, status,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Production batches retrieved", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/production/batches/:id/status
// =====================================================
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const result = await updateBatchStatus(id, status);
  return sendSuccess(res, result, "Batch status updated", httpStatusCodes.OK);
});
