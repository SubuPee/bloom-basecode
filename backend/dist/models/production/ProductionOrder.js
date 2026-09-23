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
exports.ProductionOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RawMaterialSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    requiredQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, default: "PCS" },
    availableStock: { type: Number, default: 0, min: 0 },
}, { _id: true });
const ProductionOrderSchema = new mongoose_1.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },
    variantId: {
        type: String,
        required: true,
        trim: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true,
    },
    batchNumber: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    plannedQuantity: {
        type: Number,
        required: true,
        min: 1,
    },
    producedQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    goodQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    rejectedQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        required: true,
        trim: true,
        default: "PCS",
    },
    status: {
        type: String,
        required: true,
        enum: ["Planned", "In Progress", "Partially Completed", "Completed", "Cancelled"],
        default: "Planned",
        index: true,
    },
    warehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
        index: true,
    },
    storageLocation: {
        type: String,
        trim: true,
        default: "",
    },
    expectedCompletion: {
        type: Date,
        required: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true },
    notes: {
        type: String,
        trim: true,
        default: "",
    },
    rawMaterials: {
        type: [RawMaterialSchema],
        default: [],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
ProductionOrderSchema.index({ status: 1, createdAt: -1 });
ProductionOrderSchema.index({ vendorId: 1, status: 1 });
ProductionOrderSchema.index({ productId: 1, variantId: 1 });
ProductionOrderSchema.index({ batchNumber: 1 });
exports.ProductionOrder = mongoose_1.default.model("ProductionOrder", ProductionOrderSchema);
exports.default = exports.ProductionOrder;
//# sourceMappingURL=ProductionOrder.js.map