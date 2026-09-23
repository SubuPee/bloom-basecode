import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  revokeSession,
} from "../../services/settings/profile.service";
import {
  validateUpdateProfile,
  validateChangePassword,
} from "../../validations/settings/settings.validation";

// =====================================================
// GET /api/settings/profile
// =====================================================
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?._id;
  const profile = await getUserProfile(String(userId));
  return sendSuccess(res, profile, "Profile retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// PUT /api/settings/profile
// =====================================================
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?._id;
  const errors = validateUpdateProfile(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const updated = await updateUserProfile(String(userId), req.body);
  return sendSuccess(res, updated, "Profile updated successfully", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/settings/profile/change-password
// =====================================================
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?._id;
  const errors = validateChangePassword(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const result = await changePassword(
    String(userId),
    req.body.currentPassword,
    req.body.newPassword
  );
  return sendSuccess(res, result, "Password changed successfully", httpStatusCodes.OK);
});

// =====================================================
// DELETE /api/settings/profile/sessions/:sessionId
// =====================================================
export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?._id;
  const sessionId = req.params.sessionId as string;
  const sessions = await revokeSession(String(userId), sessionId);
  return sendSuccess(res, sessions, "Session revoked successfully", httpStatusCodes.OK);
});
