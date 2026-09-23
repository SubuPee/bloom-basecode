import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getIntegrations,
  toggleIntegration,
  configureIntegration,
} from "../../services/settings/integration.service";

// =====================================================
// GET /api/settings/integrations
// =====================================================
export const listIntegrations = asyncHandler(async (req: Request, res: Response) => {
  const integrations = await getIntegrations();
  return sendSuccess(res, integrations, "Integrations retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/settings/integrations/:id/toggle
// =====================================================
export const toggle = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await toggleIntegration(id);
  return sendSuccess(res, result, `Integration status toggled to ${result.status}`, httpStatusCodes.OK);
});

// =====================================================
// PUT /api/settings/integrations/:id
// =====================================================
export const configure = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await configureIntegration(id, req.body);
  return sendSuccess(res, result, "Integration configured successfully", httpStatusCodes.OK);
});
