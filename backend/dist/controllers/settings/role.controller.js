"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRole = exports.editRole = exports.addRole = exports.getRole = exports.listRoles = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const role_service_1 = require("../../services/settings/role.service");
const settings_validation_1 = require("../../validations/settings/settings.validation");
// =====================================================
// GET /api/settings/roles
// =====================================================
exports.listRoles = (0, asyncHandler_1.default)(async (req, res) => {
    const roles = await (0, role_service_1.getRoles)();
    return (0, apiResponse_1.sendSuccess)(res, roles, "Roles retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// GET /api/settings/roles/:id
// =====================================================
exports.getRole = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const role = await (0, role_service_1.getRoleById)(id);
    return (0, apiResponse_1.sendSuccess)(res, role, "Role retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// POST /api/settings/roles
// =====================================================
exports.addRole = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, settings_validation_1.validateRole)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const role = await (0, role_service_1.createRole)(req.body);
    return (0, apiResponse_1.sendSuccess)(res, role, "Role created successfully", httpStatusCodes_1.default.CREATED);
});
// =====================================================
// PUT /api/settings/roles/:id
// =====================================================
exports.editRole = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const errors = (0, settings_validation_1.validateRole)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const role = await (0, role_service_1.updateRole)(id, req.body);
    return (0, apiResponse_1.sendSuccess)(res, role, "Role updated successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// DELETE /api/settings/roles/:id
// =====================================================
exports.removeRole = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, role_service_1.deleteRole)(id);
    return (0, apiResponse_1.sendSuccess)(res, result, "Role deleted successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=role.controller.js.map