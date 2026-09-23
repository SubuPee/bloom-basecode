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
exports.StockMovement = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StockMovementSchema = new mongoose_1.Schema({
    movementId: {
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
        index: true,
    },
    warehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
        index: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendor",
        index: true,
    },
    movementType: {
        type: String,
        required: true,
        enum: [
            "Opening Stock",
            "Purchase",
            "Production",
            "Order",
            "Order Cancellation",
            "Return",
            "Damage",
            "Expiry",
            "Adjustment",
            "Transfer In",
            "Transfer Out",
            "Manual Addition",
            "Manual Deduction",
        ],
        index: true,
    },
    referenceId: {
        type: String,
        trim: true,
        default: "",
        index: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    previousStock: {
        type: Number,
        required: true,
        min: 0,
    },
    newStock: {
        type: Number,
        required: true,
        min: 0,
    },
    batchNumber: {
        type: String,
        trim: true,
        default: "",
    },
    location: {
        type: String,
        trim: true,
        default: "",
    },
    notes: {
        type: String,
        trim: true,
        default: "",
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // immutable — no updatedAt
});
// Ledger query indices
StockMovementSchema.index({ productId: 1, variantId: 1, createdAt: -1 });
StockMovementSchema.index({ movementType: 1, createdAt: -1 });
StockMovementSchema.index({ vendorId: 1, createdAt: -1 });
StockMovementSchema.index({ warehouseId: 1, createdAt: -1 });
StockMovementSchema.index({ referenceId: 1 });
// Block update and delete at schema level — ledger is write-once
StockMovementSchema.pre("findOneAndUpdate", function () {
    throw new Error("StockMovement records are immutable — cannot be updated.");
});
exports.StockMovement = mongoose_1.default.model("StockMovement", StockMovementSchema);
exports.default = exports.StockMovement;
//# sourceMappingURL=StockMovement.js.map