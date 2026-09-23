"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePreferences = exports.listPreferences = void 0;
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const apiResponse_1 = require("../../utils/apiResponse");
const httpStatusCodes_1 = __importDefault(require("../../constants/httpStatusCodes"));
const preferences_service_1 = require("../../services/settings/preferences.service");
const settings_validation_1 = require("../../validations/settings/settings.validation");
// =====================================================
// GET /api/settings/preferences
// =====================================================
exports.listPreferences = (0, asyncHandler_1.default)(async (req, res) => {
    const preferences = await (0, preferences_service_1.getPreferences)();
    return (0, apiResponse_1.sendSuccess)(res, preferences, "Preferences retrieved successfully", httpStatusCodes_1.default.OK);
});
// =====================================================
// PUT /api/settings/preferences
// =====================================================
exports.savePreferences = (0, asyncHandler_1.default)(async (req, res) => {
    const errors = (0, settings_validation_1.validatePreferences)(req.body);
    if (Object.keys(errors).length > 0) {
        return (0, apiResponse_1.sendError)(res, "Validation failed", httpStatusCodes_1.default.BAD_REQUEST, errors);
    }
    const updated = await (0, preferences_service_1.updatePreferences)(req.body);
    return (0, apiResponse_1.sendSuccess)(res, updated, "Settings saved successfully", httpStatusCodes_1.default.OK);
});
//# sourceMappingURL=preferences.controller.js.map