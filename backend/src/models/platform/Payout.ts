import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPlatformPayout extends Document {
  payoutId: string;
  period: string;
  gross: number;
  fees: number;
  refunds: number;
  net: number;
  status: "Settled" | "Pending" | "Processing";
  bank: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPlatformPayout>(
  {
    payoutId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    gross: {
      type: Number,
      required: true,
      min: 0,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    refunds: {
      type: Number,
      default: 0,
      min: 0,
    },
    net: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Settled", "Pending", "Processing"],
      default: "Settled",
    },
    bank: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ payoutId: 1 });
payoutSchema.index({ status: 1 });

const PlatformPayout: Model<IPlatformPayout> =
  mongoose.models.PlatformPayout ||
  mongoose.model<IPlatformPayout>("PlatformPayout", payoutSchema);

export default PlatformPayout;
