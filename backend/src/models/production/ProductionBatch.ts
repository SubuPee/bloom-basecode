import mongoose, { Document, Schema, Types } from "mongoose";

// =====================================================
// PRODUCTION BATCH — Batch traceability & expiry tracking
// =====================================================

export type BatchStatus = "Active" | "Consumed" | "Expired" | "Quarantined";

export interface IProductionBatch extends Document {
  batchNumber: string;
  productionOrderId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: string;
  vendorId: Types.ObjectId;
  totalQuantity: number;      // Good output from production
  availableQuantity: number;  // Remaining unsold
  status: BatchStatus;
  warehouseId: Types.ObjectId;
  location: string;           // Bin / shelf code
  manufacturingDate: Date;
  expiryDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionBatchSchema = new Schema<IProductionBatch>(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    productionOrderId: {
      type: Schema.Types.ObjectId,
      ref: "ProductionOrder",
      required: true,
      index: true,
    },
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
    },
    vendorId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ProductionBatchSchema.index({ status: 1, manufacturingDate: -1 });
ProductionBatchSchema.index({ productId: 1, variantId: 1 });
ProductionBatchSchema.index({ expiryDate: 1 });

export const ProductionBatch = mongoose.model<IProductionBatch>(
  "ProductionBatch",
  ProductionBatchSchema
);

export default ProductionBatch;
