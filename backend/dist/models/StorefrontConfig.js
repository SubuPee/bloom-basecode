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
const mongoose_1 = __importStar(require("mongoose"));
const storefrontConfigSchema = new mongoose_1.Schema({
    storeName: {
        type: String,
        default: "bloom.store",
        trim: true,
    },
    storeDomain: {
        type: String,
        default: "bloom.store",
        trim: true,
    },
    liveUrl: {
        type: String,
        default: "https://bloom.store",
        trim: true,
    },
    heroSlug: {
        type: String,
        default: "home-banner",
        trim: true,
    },
    highlights: [
        {
            icon: { type: String, default: "Truck", trim: true },
            title: { type: String, default: "Free delivery", trim: true },
            text: { type: String, default: "On all orders above ₹999", trim: true },
        },
    ],
    announcement: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: "", trim: true },
        link: { type: String, default: "", trim: true },
    },
    seo: {
        metaTitle: {
            type: String,
            default: "Bloom — Thoughtful Modern E-Commerce",
            trim: true,
        },
        metaDescription: {
            type: String,
            default: "Discover curated collections of elevated lifestyle essentials, apparel, and home goods.",
            trim: true,
        },
        ogImage: { type: String, default: "", trim: true },
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});
const StorefrontConfig = mongoose_1.default.models.StorefrontConfig ||
    mongoose_1.default.model("StorefrontConfig", storefrontConfigSchema);
exports.default = StorefrontConfig;
//# sourceMappingURL=StorefrontConfig.js.map