"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.sendInvite = exports.setStatus = exports.updateUser = exports.createUser = exports.getUser = exports.listUsers = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const user_service_1 = require("../../services/settings/user.service");
const settings_validation_1 = require("../../validations/settings/settings.validation");
// =====================================================
// GET /api/settings/users
// =====================================================
exports.listUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const { search, role, status, page = "1", limit = "20", } = req.query;
    const result = await (0, user_service_1.getTeamUsers)({
        search, role, status,
        page: parseInt(page), limit: parseInt(limit),
    });
    return (0, apiResponse_1.sendSuccess)(res, result, "Team users retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/settings/users/:id
// =====================================================
exports.getUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const user = await (0, user_service_1.getUserById)(id);
    return (0, apiResponse_1.sendSuccess)(res, user, "User retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// POST /api/settings/users
// =====================================================
exports.createUser = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, settings_validation_1.validateCreateUser)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const result = await (0, user_service_1.createTeamUser)(req.body);
    return (0, apiResponse_1.sendSuccess)(res, result, "Team user invited successfully", httpStatusCodes_1.default.CREATED);
});
// =====================================================
// PUT /api/settings/users/:id
// =====================================================
exports.updateUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const errors = (0, settings_validation_1.validateUpdateUser)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const updated = await (0, user_service_1.updateTeamUser)(id, req.body);
    return (0, apiResponse_1.sendSuccess)(res, updated, "User updated successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/settings/users/:id/status
// =====================================================
exports.setStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    if (!status || !["Active", "Suspended", "Invited"].includes(status)) {
        return (0, apiResponse_1.sendError)(res, "Status must be Active, Suspended, or Invited", httpStatusCodes_1.default.BAD_REQUEST);
    }
    const result = await (0, user_service_1.updateUserStatus)(id, status);
    return (0, apiResponse_1.sendSuccess)(res, result, `User status updated to ${status}`, httpStatusCodes_1.default.OK);
});
// =====================================================
// POST /api/settings/users/:id/resend-invite
// =====================================================
exports.sendInvite = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, user_service_1.resendInvite)(id);
    return (0, apiResponse_1.sendSuccess)(res, result, "Invitation resent successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// DELETE /api/settings/users/:id
// =====================================================
exports.removeUser = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, user_service_1.deleteTeamUser)(id);
    return (0, apiResponse_1.sendSuccess)(res, result, "User removed successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=user.controller.js.map