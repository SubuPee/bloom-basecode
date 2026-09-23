"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferences = exports.getPreferences = void 0;
const WorkspaceSettings_1 = __importDefault(require("../../models/settings/WorkspaceSettings"));
// =====================================================
// GET WORKSPACE PREFERENCES
// =====================================================
const getPreferences = async () => {
    let settings = await WorkspaceSettings_1.default.findOne();
    if (!settings) {
        settings = await WorkspaceSettings_1.default.create({
            storeDetails: {
                storeName: "Bloom",
                supportEmail: "care@bloom.store",
                supportPhone: "+91 22 4000 1188",
                storefrontDomain: "bloom.store",
            },
            regional: {
                currency: "INR (₹)",
                timezone: "IST (UTC +5:30)",
                dateFormat: "DD MMM YYYY",
                weightUnit: "Kilogram",
            },
            notificationPreferences: {
                orders: true,
                stock: true,
                payouts: true,
                reviews: false,
                security: true,
            },
        });
    }
    return settings;
};
exports.getPreferences = getPreferences;
// =====================================================
// UPDATE WORKSPACE PREFERENCES
// =====================================================
const updatePreferences = async (data) => {
    let settings = await WorkspaceSettings_1.default.findOne();
    if (!settings) {
        settings = new WorkspaceSettings_1.default();
    }
    if (data.storeDetails) {
        settings.storeDetails = {
            ...settings.storeDetails,
            ...data.storeDetails,
        };
    }
    if (data.regional) {
        settings.regional = {
            ...settings.regional,
            ...data.regional,
        };
    }
    if (data.notificationPreferences) {
        settings.notificationPreferences = {
            ...settings.notificationPreferences,
            ...data.notificationPreferences,
        };
    }
    await settings.save();
    return settings;
};
exports.updatePreferences = updatePreferences;
//# sourceMappingURL=preferences.service.js.map