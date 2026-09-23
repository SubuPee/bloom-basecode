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
const orderItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        default: null,
    },
    productCode: {
        type: String,
        default: "",
        trim: true,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    variantId: {
        type: String,
        default: "",
        trim: true,
    },
    sku: {
        type: String,
        default: "",
        trim: true,
    },
    image: {
        type: String,
        default: "",
        trim: true,
    },
    category: {
        type: String,
        default: "",
        trim: true,
    },
    brand: {
        type: String,
        default: "",
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
}, { _id: true });
const timelineStepSchema = new mongoose_1.Schema({
    step: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    completed: {
        type: Boolean,
        default: true,
    },
}, { _id: false });
const orderAddressSchema = new mongoose_1.Schema({
    fullAddress: {
        type: String,
        required: true,
        trim: true,
    },
    addressLine1: { type: String, default: "", trim: true },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, default: "India", trim: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Customer",
        default: null,
        index: true,
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    customerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    customerPhone: {
        type: String,
        default: "",
        trim: true,
    },
    customerSegment: {
        type: String,
        default: "Returning",
        trim: true,
    },
    items: {
        type: [orderItemSchema],
        default: [],
    },
    totalQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0,
    },
    tax: {
        type: Number,
        default: 0,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    paymentStatus: {
        type: String,
        enum: ["Paid", "Pending", "Refunded", "Failed"],
        default: "Pending",
        index: true,
    },
    paymentMethod: {
        type: String,
        default: "Credit Card",
        trim: true,
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    orderStatus: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Returned", "Cancelled"],
        default: "Processing",
        index: true,
    },
    shippingAddress: {
        type: orderAddressSchema,
        required: true,
    },
    billingAddress: {
        type: orderAddressSchema,
        default: null,
    },
    fulfillmentLocation: {
        type: String,
        default: "Mumbai Central",
        trim: true,
    },
    carrier: {
        type: String,
        default: "BlueDart Express",
        trim: true,
    },
    trackingNumber: {
        type: String,
        default: "",
        trim: true,
    },
    timeline: {
        type: [timelineStepSchema],
        default: [],
    },
    customerNotes: {
        type: String,
        default: "",
        trim: true,
    },
    internalNotes: {
        type: String,
        default: "",
        trim: true,
    },
    source: {
        type: String,
        default: "web_storefront",
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
const Order = mongoose_1.default.models.Order || mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
//# sourceMappingURL=Order.js.map