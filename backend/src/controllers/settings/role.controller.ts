import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../services/settings/role.service";
import { validateRole } from "../../validations/settings/settings.validation";

// =====================================================
// GET /api/settings/roles
// =====================================================
export const listRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await getRoles();
  return sendSuccess(res, roles, "Roles retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/settings/roles/:id
// =====================================================
export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const role = await getRoleById(id);
  return sendSuccess(res, role, "Role retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// POST /api/settings/roles
// =====================================================
export const addRole = asyncHandler(async (req: Request, res: Response) => {
  const errors = validateRole(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const role = await createRole(req.body);
  return sendSuccess(res, role, "Role created successfully", httpStatusCodes.CREATED);
});

// =====================================================
// PUT /api/settings/roles/:id
// =====================================================
export const editRole = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const errors = validateRole(req.body);
  if (Object.keys(errors).length > 0) {
    return sendError(res, "Validation failed", httpStatusCodes.BAD_REQUEST, errors);
  }

  const role = await updateRole(id, req.body);
  return sendSuccess(res, role, "Role updated successfully", httpStatusCodes.OK);
});

// =====================================================
// DELETE /api/settings/roles/:id
// =====================================================
export const removeRole = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await deleteRole(id);
  return sendSuccess(res, result, "Role deleted successfully", httpStatusCodes.OK);
});
