"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorActivityLog = exports.VendorTransaction = exports.VendorReturn = exports.VendorPayment = exports.VendorSettlement = exports.VendorOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// =====================================================
// VENDOR ORDER MODEL
// =====================================================
const orderItemSchema = new mongoose_1.default.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantId: { type: String, default: "" },
    variantName: { type: String, default: "" },
    sku: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    vendorId: { type: String, required: true },
}, { _id: false });
const vendorOrderSchema = new mongoose_1.default.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    billingAddress: { type: String, default: "" },
    vendorId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    items: [orderItemSchema],
    totalQuantity: { type: Number, required: true },
    grossAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    vendorGross: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    vendorEarnings: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ["Paid", "Pending", "Refunded", "Failed"],
        default: "Pending",
        index: true,
    },
    orderStatus: {
        type: String,
        enum: [
            "New",
            "Confirmed",
            "Processing",
            "Ready to Ship",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
            "Returned",
            "Refunded",
        ],
        default: "New",
        index: true,
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    timeline: [
        {
            status: { type: String, required: true },
            date: { type: String, required: true },
            description: { type: String, required: true },
        },
    ],
}, { timestamps: true });
vendorOrderSchema.index({ vendorId: 1, orderStatus: 1, createdAt: -1 });
vendorOrderSchema.index({ vendorId: 1, paymentStatus: 1 });
// =====================================================
// VENDOR SETTLEMENT MODEL
// =====================================================
const vendorSettlementSchema = new mongoose_1.default.Schema({
    settlementId: { type: String, required: true, unique: true, index: true },
    vendorId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    settlementPeriod: { type: String, required: true },
    totalSales: { type: Number, required: true },
    commission: { type: Number, required: true },
    refunds: { type: Number, default: 0 },
    adjustments: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    netPayable: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Approved", "Processing", "Paid", "Failed", "On Hold"],
        default: "Pending",
        index: true,
    },
    settlementDate: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    paidDate: { type: String, default: null },
    referenceNumber: { type: String, default: null },
    notes: { type: String, default: "" },
}, { timestamps: true });
vendorSettlementSchema.index({ vendorId: 1, paymentStatus: 1, createdAt: -1 });
// =====================================================
// VENDOR PAYMENT / PAYOUT MODEL
// =====================================================
const vendorPaymentSchema = new mongoose_1.default.Schema({
    paymentId: { type: String, required: true, unique: true, index: true },
    settlementId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
        type: String,
        enum: ["NEFT", "RTGS", "IMPS", "UPI"],
        default: "NEFT",
    },
    bankAccountMasked: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    referenceId: { type: String, default: "" }, // UTR
    status: {
        type: String,
        enum: ["Pending", "Approved", "Processing", "Completed", "Failed", "On Hold"],
        default: "Approved",
        index: true,
    },
    requestedDate: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    processedDate: { type: String, default: null },
    processedBy: { type: String, default: null },
    failureReason: { type: String, default: null },
}, { timestamps: true });
vendorPaymentSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
// =====================================================
// VENDOR RETURN MODEL
// =====================================================
const vendorReturnSchema = new mongoose_1.default.Schema({
    returnId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantId: { type: String, default: "" },
    variantName: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    customerReason: { type: String, default: "" },
    inspectionResult: {
        type: String,
        enum: ["Pending", "Good", "Damaged", "Expired", "Missing", "Needs Inspection"],
        default: "Pending",
    },
    dispositionAction: {
        type: String,
        enum: ["Restock", "Scrap", "Return to Vendor", null],
        default: null,
    },
    refundAmount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: [
            "Requested",
            "Approved",
            "Pickup",
            "Received",
            "Inspecting",
            "Approved for Refund",
            "Rejected",
            "Refunded",
            "Closed",
        ],
        default: "Requested",
        index: true,
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    },
    inspectedBy: { type: String, default: null },
    inspectionNotes: { type: String, default: null },
}, { timestamps: true });
vendorReturnSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
// =====================================================
// VENDOR TRANSACTION MODEL
// =====================================================
const vendorTransactionSchema = new mongoose_1.default.Schema({
    transactionId: { type: String, required: true, unique: true, index: true },
    vendorId: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    orderId: { type: String, default: null },
    orderNumber: { type: String, default: null },
    type: {
        type: String,
        enum: [
            "Order Sale",
            "Commission",
            "Vendor Settlement",
            "Refund",
            "Return Deduction",
            "Shipping Charge",
            "Tax",
            "Adjustment",
            "Withdrawal",
            "Payment",
        ],
        required: true,
        index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Completed", "Failed", "Cancelled", "Reversed"],
        default: "Completed",
        index: true,
    },
    referenceId: { type: String, default: "" },
    description: { type: String, default: "" },
    createdDate: {
        type: String,
        default: () => new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
    },
}, { timestamps: true });
vendorTransactionSchema.index({ vendorId: 1, status: 1, type: 1, createdAt: -1 });
// =====================================================
// VENDOR ACTIVITY LOG MODEL
// =====================================================
const vendorActivityLogSchema = new mongoose_1.default.Schema({
    logId: { type: String, required: true, unique: true, index: true },
    user: { type: String, required: true },
    action: { type: String, required: true },
    entity: {
        type: String,
        enum: ["Vendor", "Document", "Settlement", "Order", "Inventory", "Payment", "Return"],
        required: true,
        index: true,
    },
    entityId: { type: String, required: true, index: true },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    timestamp: {
        type: String,
        default: () => new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
    },
}, { timestamps: true });
vendorActivityLogSchema.index({ entityId: 1, entity: 1, createdAt: -1 });
exports.VendorOrder = mongoose_1.default.models.VendorOrder || mongoose_1.default.model("VendorOrder", vendorOrderSchema);
exports.VendorSettlement = mongoose_1.default.models.VendorSettlement || mongoose_1.default.model("VendorSettlement", vendorSettlementSchema);
exports.VendorPayment = mongoose_1.default.models.VendorPayment || mongoose_1.default.model("VendorPayment", vendorPaymentSchema);
exports.VendorReturn = mongoose_1.default.models.VendorReturn || mongoose_1.default.model("VendorReturn", vendorReturnSchema);
exports.VendorTransaction = mongoose_1.default.models.VendorTransaction || mongoose_1.default.model("VendorTransaction", vendorTransactionSchema);
exports.VendorActivityLog = mongoose_1.default.models.VendorActivityLog || mongoose_1.default.model("VendorActivityLog", vendorActivityLogSchema);
//# sourceMappingURL=VendorRelated.js.map