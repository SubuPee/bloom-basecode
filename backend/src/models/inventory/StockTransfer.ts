import mongoose, { Document, Schema, Types } from "mongoose";

// =====================================================
// STOCK TRANSFER — Inter-warehouse 2-phase transfers
// =====================================================

export type TransferStatus = "Pending" | "In Transit" | "Completed" | "Cancelled";

export interface IStockTransfer extends Document {
  transferId: string;          // TRF-XXXXXX
  productId: Types.ObjectId;
  variantId: string;
  fromWarehouseId: Types.ObjectId;
  toWarehouseId: Types.ObjectId;
  quantity: number;
  status: TransferStatus;
  batchNumber: string;
  notes: string;
  dispatchedAt?: Date;
  receivedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferSchema = new Schema<IStockTransfer>(
  {
    transferId: {
      type: String,
      required: true,
      unique: true,
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
    fromWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },
    toWarehouseId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

StockTransferSchema.index({ status: 1, createdAt: -1 });
StockTransferSchema.index({ fromWarehouseId: 1, status: 1 });
StockTransferSchema.index({ toWarehouseId: 1, status: 1 });
StockTransferSchema.index({ productId: 1, variantId: 1, status: 1 });

export const StockTransfer = mongoose.model<IStockTransfer>(
  "StockTransfer",
  StockTransferSchema
);

export default StockTransfer;
