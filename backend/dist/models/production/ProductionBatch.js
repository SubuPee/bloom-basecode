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
exports.ProductionBatch = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductionBatchSchema = new mongoose_1.Schema({
    batchNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    productionOrderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductionOrder",
        required: true,
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
        index: true,
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ["Active", "Consumed", "Expired", "Quarantined"],
        default: "Active",
        index: true,
    },
    warehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
    },
    location: {
        type: String,
        trim: true,
        default: "",
    },
    manufacturingDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
ProductionBatchSchema.index({ status: 1, manufacturingDate: -1 });
ProductionBatchSchema.index({ productId: 1, variantId: 1 });
ProductionBatchSchema.index({ expiryDate: 1 });
exports.ProductionBatch = mongoose_1.default.model("ProductionBatch", ProductionBatchSchema);
exports.default = exports.ProductionBatch;
//# sourceMappingURL=ProductionBatch.js.map