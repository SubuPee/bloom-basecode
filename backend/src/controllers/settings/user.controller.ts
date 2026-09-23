import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getTeamUsers,
  getUserById,
  createTeamUser,
  updateTeamUser,
  updateUserStatus,
  resendInvite,
  deleteTeamUser,
} from "../../services/settings/user.service";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../../validations/settings/settings.validation";

// =====================================================
// GET /api/settings/users
// =====================================================
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, role, status,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getTeamUsers({
    search, role, status,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Team users retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/settings/users/:id
// =====================================================
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await getUserById(id);
  return sendSuccess(res, user, "User retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// POST /api/settings/users
// =====================================================
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateCreateUser(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const result = await createTeamUser(req.body);
  return sendSuccess(res, result, "Team user invited successfully", httpStatusCodes.CREATED);
});

// =====================================================
// PUT /api/settings/users/:id
// =====================================================
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const errors = validateUpdateUser(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const updated = await updateTeamUser(id, req.body);
  return sendSuccess(res, updated, "User updated successfully", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/settings/users/:id/status
// =====================================================
export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  if (!status || !["Active", "Suspended", "Invited"].includes(status)) {
    return sendError(res, "Status must be Active, Suspended, or Invited", httpStatusCodes.BAD_REQUEST);
  }

  const result = await updateUserStatus(id, status);
  return sendSuccess(res, result, `User status updated to ${status}`, httpStatusCodes.OK);
});

// =====================================================
// POST /api/settings/users/:id/resend-invite
// =====================================================
export const sendInvite = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await resendInvite(id);
  return sendSuccess(res, result, "Invitation resent successfully", httpStatusCodes.OK);
});

// =====================================================
// DELETE /api/settings/users/:id
// =====================================================
export const removeUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await deleteTeamUser(id);
  return sendSuccess(res, result, "User removed successfully", httpStatusCodes.OK);
});
