"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const auth_validation_1 = require("../validations/auth.validation");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const apiResponse_1 = require("../utils/apiResponse");
// =====================================================
// AUTHENTICATION CONTROLLER (Thin - Transport Layer Only)
// =====================================================
exports.login = (0, asyncHandler_1.default)(async (req, res) => {
    const credentials = (0, auth_validation_1.validateLoginInput)(req.body);
    const data = await auth_service_1.default.loginAdmin(credentials);
    return (0, apiResponse_1.sendSuccess)(res, data, "Login successful");
});
exports.getMe = (0, asyncHandler_1.default)(async (req, res) => {
    const data = await auth_service_1.default.getCurrentUser(req.user);
    return (0, apiResponse_1.sendSuccess)(res, data, "Current admin retrieved successfully");
});
exports.default = {
    login: exports.login,
    getMe: exports.getMe,
};
//# sourceMappingURL=auth.controller.js.map