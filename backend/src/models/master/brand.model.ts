import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBrand extends Document {
  brandCode: string;
  brandName: string;
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    brandCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
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

brandSchema.index({ brandName: 1 });
brandSchema.index({ status: 1 });

export const Brand: Model<IBrand> =
  (mongoose.models.BrandMaster as Model<IBrand>) ||
  mongoose.model<IBrand>("BrandMaster", brandSchema);

export default Brand;