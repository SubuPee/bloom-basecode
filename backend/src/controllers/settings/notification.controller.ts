import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import httpStatusCodes from "../../constants/httpStatusCodes";
import {
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
} from "../../services/settings/notification.service";

// =====================================================
// GET /api/settings/notifications
// =====================================================
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const {
    search, type, priority, read,
    page = "1", limit = "20",
  } = req.query as Record<string, string>;

  const result = await getNotifications({
    search, type, priority, read,
    page: parseInt(page), limit: parseInt(limit),
  });

  return sendSuccess(res, result, "Notifications retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// GET /api/settings/notifications/:id
// =====================================================
export const getNotification = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = await getNotificationById(id);
  return sendSuccess(res, item, "Notification retrieved successfully", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/settings/notifications/:id/read
// =====================================================
export const toggleRead = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { read = true } = req.body;
  const updated = await markNotificationRead(id, Boolean(read));
  return sendSuccess(res, updated, "Notification read status updated", httpStatusCodes.OK);
});

// =====================================================
// PATCH /api/settings/notifications/mark-all-read
// =====================================================
export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await markAllNotificationsRead();
  return sendSuccess(res, result, "All notifications marked as read", httpStatusCodes.OK);
});

// =====================================================
// DELETE /api/settings/notifications/:id
// =====================================================
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await archiveNotification(id);
  return sendSuccess(res, result, "Notification archived successfully", httpStatusCodes.OK);
});
