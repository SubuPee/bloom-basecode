"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllRead = exports.toggleRead = exports.getNotification = exports.listNotifications = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const notification_service_1 = require("../../services/settings/notification.service");
// =====================================================
// GET /api/settings/notifications
// =====================================================
exports.listNotifications = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, type, priority, read, page = "1", limit = "20", } = req.query;
    const result = await (0, notification_service_1.getNotifications)({
        search, type, priority, read,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Notifications retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/settings/notifications/:id
// =====================================================
exports.getNotification = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const item = await (0, notification_service_1.getNotificationById)(id);
    return (0, apiResponse_1.sendSuccess)(res, item, "Notification retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/settings/notifications/:id/read
// =====================================================
exports.toggleRead = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const { read = true } = req.body;
    const updated = await (0, notification_service_1.markNotificationRead)(id, Boolean(read));
    return (0, apiResponse_1.sendSuccess)(res, updated, "Notification read status updated", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/settings/notifications/mark-all-read
// =====================================================
exports.markAllRead = (0, asyncHandler_1.default)(async (req, res) => {
    const result = await (0, notification_service_1.markAllNotificationsRead)();
    return (0, apiResponse_1.sendSuccess)(res, result, "All notifications marked as read", httpStatusCodes_1.default.OK);
});
// =====================================================
// DELETE /api/settings/notifications/:id
// =====================================================
exports.deleteNotification = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, notification_service_1.archiveNotification)(id);
    return (0, apiResponse_1.sendSuccess)(res, result, "Notification archived successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=notification.controller.js.map