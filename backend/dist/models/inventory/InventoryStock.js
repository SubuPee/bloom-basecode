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
exports.InventoryStock = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InventoryStockSchema = new mongoose_1.Schema({
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
        required: true,
        index: true,
    },
    sku: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    unitCode: {
        type: String,
        required: true,
        trim: true,
        default: "pcs",
    },
    batchNumber: {
        type: String,
        trim: true,
        default: "",
    },
    availableStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    reservedStock: {
        type: Number,
        min: 0,
        default: 0,
    },
    inTransitStock: {
        type: Number,
        min: 0,
        default: 0,
    },
    damagedStock: {
        type: Number,
        min: 0,
        default: 0,
    },
    expiredStock: {
        type: Number,
        min: 0,
        default: 0,
    },
    minStock: {
        type: Number,
        min: 0,
        default: 10,
    },
    reorderLevel: {
        type: Number,
        min: 0,
        default: 50,
    },
    softDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual: total physical stock across all pools
InventoryStockSchema.virtual("totalStock").get(function () {
    return (this.availableStock +
        this.reservedStock +
        this.inTransitStock +
        this.damagedStock +
        this.expiredStock);
});
// Compound unique index: one record per variant per warehouse
InventoryStockSchema.index({ productId: 1, variantId: 1, warehouseId: 1 }, { unique: true });
InventoryStockSchema.index({ softDeleted: 1, availableStock: 1 });
InventoryStockSchema.index({ vendorId: 1, softDeleted: 1 });
InventoryStockSchema.index({ sku: 1 });
exports.InventoryStock = mongoose_1.default.model("InventoryStock", InventoryStockSchema);
exports.default = exports.InventoryStock;
//# sourceMappingURL=InventoryStock.js.map