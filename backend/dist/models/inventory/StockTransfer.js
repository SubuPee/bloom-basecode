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
exports.StockTransfer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StockTransferSchema = new mongoose_1.Schema({
    transferId: {
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
    fromWarehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
        index: true,
    },
    toWarehouseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
        index: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "In Transit", "Completed", "Cancelled"],
        default: "In Transit",
        index: true,
    },
    batchNumber: {
        type: String,
        trim: true,
        default: "",
    },
    notes: {
        type: String,
        trim: true,
        default: "",
    },
    dispatchedAt: {
        type: Date,
    },
    receivedAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
    cancelReason: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
StockTransferSchema.index({ status: 1, createdAt: -1 });
StockTransferSchema.index({ fromWarehouseId: 1, status: 1 });
StockTransferSchema.index({ toWarehouseId: 1, status: 1 });
StockTransferSchema.index({ productId: 1, variantId: 1, status: 1 });
exports.StockTransfer = mongoose_1.default.model("StockTransfer", StockTransferSchema);
exports.default = exports.StockTransfer;
//# sourceMappingURL=StockTransfer.js.map