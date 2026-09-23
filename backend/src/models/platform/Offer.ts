import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOffer extends Document {
  code: string;
  title: string;
  type: "Percent" | "Flat" | "Free shipping" | "BOGO";
  value: string;
  minOrder: number;
  used: number;
  limit: number;
  status: "Active" | "Scheduled" | "Expired";
  window: string;
  audience: string;
  isActive: boolean;
  softDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Percent", "Flat", "Free shipping", "BOGO"],
      default: "Percent",
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    limit: {
      type: Number,
      default: 1000,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Active", "Scheduled", "Expired"],
      default: "Active",
    },
    window: {
      type: String,
      default: "Always on",
      trim: true,
    },
    audience: {
      type: String,
      default: "All customers",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    softDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ code: 1, softDeleted: 1 });
offerSchema.index({ status: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;
