"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.updatePassword = exports.updateProfile = exports.getProfile = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const profile_service_1 = require("../../services/settings/profile.service");
const settings_validation_1 = require("../../validations/settings/settings.validation");
// =====================================================
// GET /api/settings/profile
// =====================================================
exports.getProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const profile = await (0, profile_service_1.getUserProfile)(String(userId));
    return (0, apiResponse_1.sendSuccess)(res, profile, "Profile retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PUT /api/settings/profile
// =====================================================
exports.updateProfile = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const errors = (0, settings_validation_1.validateUpdateProfile)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const updated = await (0, profile_service_1.updateUserProfile)(String(userId), req.body);
    return (0, apiResponse_1.sendSuccess)(res, updated, "Profile updated successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/settings/profile/change-password
// =====================================================
exports.updatePassword = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const errors = (0, settings_validation_1.validateChangePassword)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const result = await (0, profile_service_1.changePassword)(String(userId), req.body.currentPassword, req.body.newPassword);
    return (0, apiResponse_1.sendSuccess)(res, result, "Password changed successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// DELETE /api/settings/profile/sessions/:sessionId
// =====================================================
exports.deleteSession = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const sessionId = req.params.sessionId;
    const sessions = await (0, profile_service_1.revokeSession)(String(userId), sessionId);
    return (0, apiResponse_1.sendSuccess)(res, sessions, "Session revoked successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=profile.controller.js.map