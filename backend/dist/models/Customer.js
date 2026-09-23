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
const customerSchema = new mongoose_1.Schema({
    customerCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    ordersCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0,
    },
    segment: {
        type: String,
        enum: ["VIP", "Returning", "New", "At risk"],
        default: "New",
        index: true,
    },
    city: {
        type: String,
        default: "",
        trim: true,
    },
    address: {
        type: String,
        default: "",
        trim: true,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
        index: true,
    },
    joinedDate: {
        type: Date,
        default: Date.now,
    },
    preferences: {
        deliveryPreference: {
            type: String,
            default: "Prefers standard delivery",
            trim: true,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        favoriteCategory: {
            type: String,
            default: "Electronics",
            trim: true,
        },
    },
    shippingAddress: {
        fullAddress: { type: String, default: "", trim: true },
        city: { type: String, default: "", trim: true },
        state: { type: String, default: "", trim: true },
        postalCode: { type: String, default: "", trim: true },
        country: { type: String, default: "India", trim: true },
    },
    billingAddress: {
        sameAsShipping: { type: Boolean, default: true },
        fullAddress: { type: String, default: "", trim: true },
        city: { type: String, default: "", trim: true },
        state: { type: String, default: "", trim: true },
        postalCode: { type: String, default: "", trim: true },
        country: { type: String, default: "India", trim: true },
    },
    notes: {
        type: String,
        default: "",
        trim: true,
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
const Customer = mongoose_1.default.models.Customer || mongoose_1.default.model("Customer", customerSchema);
exports.default = Customer;
//# sourceMappingURL=Customer.js.map