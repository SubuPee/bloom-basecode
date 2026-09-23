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
exports.Vendor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const vendorDocumentSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            "PAN Card",
            "GST Certificate",
            "Business Registration",
            "Address Proof",
            "Bank Proof",
            "Owner ID",
            "Other",
        ],
    },
    documentNumber: {
        type: String,
        trim: true,
        default: "",
    },
    fileName: {
        type: String,
        required: true,
        trim: true,
    },
    fileSize: {
        type: String,
        default: "0 KB",
    },
    fileUrl: {
        type: String,
        default: "",
    },
    uploadedDate: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    expiryDate: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected", "Expired"],
        default: "Pending",
    },
    verifiedBy: {
        type: String,
        default: null,
    },
    verifiedDate: {
        type: String,
        default: null,
    },
    notes: {
        type: String,
        default: null,
    },
}, {
    _id: false,
});
// =====================================================
// VENDOR MAIN SCHEMA
// =====================================================
const vendorSchema = new mongoose_1.default.Schema({
    vendorId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true,
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    ownerName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    businessType: {
        type: String,
        enum: ["Manufacturer", "Wholesaler", "D2C Brand", "Distributor"],
        default: "Manufacturer",
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    alternatePhone: {
        type: String,
        trim: true,
        default: "",
    },
    website: {
        type: String,
        trim: true,
        default: "",
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        default: "India",
        trim: true,
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
    },
    taxInfo: {
        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
            index: true,
        },
        panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
            index: true,
        },
        taxType: {
            type: String,
            enum: ["Standard GST", "Composition", "Exempt", "Special Economic Zone"],
            default: "Standard GST",
        },
    },
    bankInfo: {
        accountHolder: {
            type: String,
            trim: true,
            default: "",
        },
        accountNumber: {
            type: String,
            trim: true,
            default: "",
        },
        bankName: {
            type: String,
            trim: true,
            default: "",
        },
        ifsc: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },
        branch: {
            type: String,
            trim: true,
            default: "",
        },
        upiId: {
            type: String,
            trim: true,
            default: "",
        },
    },
    registrationDate: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    documentsStatus: {
        type: String,
        enum: ["Complete", "Under Review", "Action Required", "Verified", "Pending"],
        default: "Pending",
        index: true,
    },
    kycStatus: {
        type: String,
        enum: ["Pending", "Verified", "Rejected", "In Review"],
        default: "Pending",
        index: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Under Review", "Approved", "Rejected", "Suspended", "Inactive"],
        default: "Pending",
        index: true,
    },
    commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100,
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5,
    },
    notes: {
        type: String,
        default: "",
    },
    softDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    documents: [vendorDocumentSchema],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});
// =====================================================
// OPTIMIZED HIGH-PERFORMANCE INDEXES
// =====================================================
// Compound index for registration queues and status filtering
vendorSchema.index({ softDeleted: 1, status: 1, createdAt: -1 });
vendorSchema.index({ softDeleted: 1, kycStatus: 1, createdAt: -1 });
vendorSchema.index({ softDeleted: 1, businessType: 1, createdAt: -1 });
// Text search index for global vendor search
vendorSchema.index({
    businessName: "text",
    ownerName: "text",
    email: "text",
    phone: "text",
    city: "text",
});
exports.Vendor = mongoose_1.default.models.Vendor || mongoose_1.default.model("Vendor", vendorSchema);
exports.default = exports.Vendor;
//# sourceMappingURL=Vendor.js.map