import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IWarehouse extends Document {
  warehouseCode: string;
  warehouseName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    warehouseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    warehouseName: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

warehouseSchema.index({ warehouseName: 1 });
warehouseSchema.index({ city: 1 });
warehouseSchema.index({ state: 1 });
warehouseSchema.index({ status: 1 });

export const Warehouse: Model<IWarehouse> =
  (mongoose.models.WarehouseMaster as Model<IWarehouse>) ||
  mongoose.model<IWarehouse>("WarehouseMaster", warehouseSchema);

if (!mongoose.models.Warehouse) {
  mongoose.model<IWarehouse>("Warehouse", warehouseSchema, "warehousemasters");
}

export default Warehouse;