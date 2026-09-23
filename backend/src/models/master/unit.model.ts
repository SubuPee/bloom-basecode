import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUnit extends Document {
  unitCode: string;
  unitName: string;
  symbol: string;
  unitType: "quantity" | "weight" | "length" | "volume" | "area";
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const unitSchema = new Schema<IUnit>(
  {
    unitCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    unitName: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    unitType: {
      type: String,
      required: true,
      enum: ["quantity", "weight", "length", "volume", "area"],
      lowercase: true,
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

unitSchema.index({ unitName: 1 });
unitSchema.index({ symbol: 1 });
unitSchema.index({ unitType: 1 });
unitSchema.index({ status: 1 });

export const Unit: Model<IUnit> =
  (mongoose.models.UnitMaster as Model<IUnit>) ||
  mongoose.model<IUnit>("UnitMaster", unitSchema);

export default Unit;