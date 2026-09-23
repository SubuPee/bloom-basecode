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
const cmsContentSchema = new mongoose_1.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            "Homepage banner",
            "Editorial page",
            "Policy page",
            "Campaign",
            "Content page",
        ],
        default: "Content page",
        index: true,
    },
    status: {
        type: String,
        enum: ["Published", "Draft", "Archived"],
        default: "Draft",
        index: true,
    },
    author: {
        type: String,
        default: "Alex Morgan",
        trim: true,
    },
    placement: {
        type: String,
        default: "Homepage · Hero",
        trim: true,
    },
    summary: {
        type: String,
        default: "",
        trim: true,
    },
    body: {
        type: String,
        default: "",
    },
    visibility: {
        type: String,
        default: "All regions · Desktop & mobile",
        trim: true,
    },
    version: {
        type: Number,
        default: 1,
        min: 1,
    },
    tags: {
        type: [String],
        default: [],
    },
    heroConfig: {
        ctaText: { type: String, default: "Shop the edit", trim: true },
        ctaLink: { type: String, default: "/storefront", trim: true },
        badgeText: { type: String, default: "Seasonal Edit", trim: true },
        backgroundTone: { type: String, default: "bg-blue-soft text-blue", trim: true },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});
const CmsContent = mongoose_1.default.models.CmsContent ||
    mongoose_1.default.model("CmsContent", cmsContentSchema);
exports.default = CmsContent;
//# sourceMappingURL=CmsContent.js.map