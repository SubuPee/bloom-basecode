import { Request, Response } from "express";
import authService from "../services/auth.service";
import { validateLoginInput } from "../validations/auth.validation";
import asyncHandler from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

// =====================================================
// AUTHENTICATION CONTROLLER (Thin - Transport Layer Only)
// =====================================================

export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials = validateLoginInput(req.body);
  const data = await authService.loginAdmin(credentials);
  return sendSuccess(res, data, "Login successful");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.getCurrentUser(req.user);
  return sendSuccess(res, data, "Current admin retrieved successfully");
});

export default {
  login,
  getMe,
};
