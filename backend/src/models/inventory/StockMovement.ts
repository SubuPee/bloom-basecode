import mongoose, { Document, Schema, Types } from "mongoose";

// =====================================================
// STOCK MOVEMENT — Immutable append-only ledger
// Every stock mutation creates exactly one record here.
// =====================================================

export type MovementType =
  | "Opening Stock"
  | "Purchase"
  | "Production"
  | "Order"
  | "Order Cancellation"
  | "Return"
  | "Damage"
  | "Expiry"
  | "Adjustment"
  | "Transfer In"
  | "Transfer Out"
  | "Manual Addition"
  | "Manual Deduction";

export interface IStockMovement extends Document {
  movementId: string;        // SMV-XXXXXX
  productId: Types.ObjectId;
  variantId: string;
  warehouseId: Types.ObjectId;
  vendorId?: Types.ObjectId;
  movementType: MovementType;
  referenceId: string;       // Order ID, Transfer ID, PO number, etc.
  quantity: number;          // Positive = in, negative = out
  previousStock: number;     // availableStock snapshot before
  newStock: number;          // availableStock snapshot after
  batchNumber: string;
  location: string;          // Bin / shelf within warehouse
  notes: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    movementId: {
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // immutable — no updatedAt
  }
);

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

export const StockMovement = mongoose.model<IStockMovement>(
  "StockMovement",
  StockMovementSchema
);

export default StockMovement;
