import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getPreferences,
  updatePreferences,
} from "../../services/settings/preferences.service";
import { validatePreferences } from "../../validations/settings/settings.validation";

// =====================================================
// GET /api/settings/preferences
// =====================================================
export const listPreferences = asyncHandler(async (req: Request, res: Response) => {
  const preferences = await getPreferences();
  return sendSuccess(res, preferences, "Preferences retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// PUT /api/settings/preferences
// =====================================================
export const savePreferences = asyncHandler(async (req: Request, res: Response) => {
  const errors = validatePreferences(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const updated = await updatePreferences(req.body);
  return sendSuccess(res, updated, "Settings saved successfully", httpStatusCodes.OK);
});
