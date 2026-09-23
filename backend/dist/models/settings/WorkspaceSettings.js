"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const workspaceSettingsSchema = new mongoose_1.Schema({
    storeDetails: {
        storeName: { type: String, default: "Bloom" },
        supportEmail: { type: String, default: "care@bloom.store" },
        supportPhone: { type: String, default: "+91 22 4000 1188" },
        storefrontDomain: { type: String, default: "bloom.store" },
    },
    regional: {
        currency: { type: String, default: "INR (₹)" },
        timezone: { type: String, default: "IST (UTC +5:30)" },
        dateFormat: { type: String, default: "DD MMM YYYY" },
        weightUnit: { type: String, default: "Kilogram" },
    },
    notificationPreferences: {
        orders: { type: Boolean, default: true },
        stock: { type: Boolean, default: true },
        payouts: { type: Boolean, default: true },
        reviews: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
});
exports.WorkspaceSettings = mongoose_1.default.models.WorkspaceSettings ||
    mongoose_1.default.model("WorkspaceSettings", workspaceSettingsSchema);
exports.default = exports.WorkspaceSettings;
//# sourceMappingURL=WorkspaceSettings.js.map