"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configure = exports.toggle = exports.listIntegrations = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const integration_service_1 = require("../../services/settings/integration.service");
// =====================================================
// GET /api/settings/integrations
// =====================================================
exports.listIntegrations = (0, asyncHandler_1.default)(async (req, res) => {
    const integrations = await (0, integration_service_1.getIntegrations)();
    return (0, apiResponse_1.sendSuccess)(res, integrations, "Integrations retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PATCH /api/settings/integrations/:id/toggle
// =====================================================
exports.toggle = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, integration_service_1.toggleIntegration)(id);
    return (0, apiResponse_1.sendSuccess)(res, result, `Integration status toggled to ${result.status}`, httpStatusCodes_1.default.OK);
});
// =====================================================
// PUT /api/settings/integrations/:id
// =====================================================
exports.configure = (0, asyncHandler_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await (0, integration_service_1.configureIntegration)(id, req.body);
    return (0, apiResponse_1.sendSuccess)(res, result, "Integration configured successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=integration.controller.js.map