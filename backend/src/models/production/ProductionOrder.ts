import mongoose, { Document, Schema, Types } from "mongoose";

// =====================================================
// PRODUCTION ORDER — Manufacturing work orders
// =====================================================

export type ProductionStatus =
  | "Planned"
  | "In Progress"
  | "Partially Completed"
  | "Completed"
  | "Cancelled";

export interface IRawMaterial {
  name: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
}

export interface IProductionOrder extends Document {
  orderId: string;             // PRD-XXXXXX
  productId: Types.ObjectId;
  variantId: string;
  vendorId: Types.ObjectId;
  batchNumber: string;
  plannedQuantity: number;
  producedQuantity: number;
  goodQuantity: number;
  rejectedQuantity: number;
  unit: string;
  status: ProductionStatus;
  warehouseId: Types.ObjectId;
  storageLocation: string;
  expectedCompletion: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  notes: string;
  rawMaterials: IRawMaterial[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    name: { type: String, required: true, trim: true },
    requiredQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, default: "PCS" },
    availableStock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const ProductionOrderSchema = new Schema<IProductionOrder>(
  {
    orderId: {
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
    vendorId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ProductionOrderSchema.index({ status: 1, createdAt: -1 });
ProductionOrderSchema.index({ vendorId: 1, status: 1 });
ProductionOrderSchema.index({ productId: 1, variantId: 1 });
ProductionOrderSchema.index({ batchNumber: 1 });

export const ProductionOrder = mongoose.model<IProductionOrder>(
  "ProductionOrder",
  ProductionOrderSchema
);

export default ProductionOrder;
