import mongoose, { Document, Schema, Types } from "mongoose";

// =====================================================
// INVENTORY STOCK — Live per-variant stock levels
// =====================================================

export interface IInventoryStock extends Document {
  productId: Types.ObjectId;
  variantId: string;
  warehouseId: Types.ObjectId;
  vendorId: Types.ObjectId;
  sku: string;
  unitCode: string;
  batchNumber: string;
  availableStock: number;   // Ready-to-sell qty
  reservedStock: number;    // Allocated to pending orders
  inTransitStock: number;   // Mid-transfer qty
  damagedStock: number;     // Non-sellable defectives
  expiredStock: number;     // Quarantined / disposed units
  totalStock: number;       // Virtual: sum of all pools
  minStock: number;         // Low-stock trigger threshold
  reorderLevel: number;     // Target restock qty
  softDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryStockSchema = new Schema<IInventoryStock>(
  {
    productId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total physical stock across all pools
InventoryStockSchema.virtual("totalStock").get(function (this: IInventoryStock) {
  return (
    this.availableStock +
    this.reservedStock +
    this.inTransitStock +
    this.damagedStock +
    this.expiredStock
  );
});

// Compound unique index: one record per variant per warehouse
InventoryStockSchema.index(
  { productId: 1, variantId: 1, warehouseId: 1 },
  { unique: true }
);

InventoryStockSchema.index({ softDeleted: 1, availableStock: 1 });
InventoryStockSchema.index({ vendorId: 1, softDeleted: 1 });
InventoryStockSchema.index({ sku: 1 });

export const InventoryStock = mongoose.model<IInventoryStock>(
  "InventoryStock",
  InventoryStockSchema
);

export default InventoryStock;
