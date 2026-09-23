import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITax extends Document {
  taxCode: string;
  taxName: string;
  taxRate: number;
  taxType: "percentage" | "fixed";
  description: string;
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const taxSchema = new Schema<ITax>(
  {
    taxCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    taxName: {
      type: String,
      required: true,
      trim: true,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
    },
    taxType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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

taxSchema.index({ taxName: 1 });
taxSchema.index({ taxType: 1 });
taxSchema.index({ status: 1 });

export const Tax: Model<ITax> =
  (mongoose.models.TaxMaster as Model<ITax>) ||
  mongoose.model<ITax>("TaxMaster", taxSchema);

export default Tax;