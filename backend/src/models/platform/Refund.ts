import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPlatformRefund extends Document {
  refundId: string;
  orderId: string;
  customer: string;
  amount: number;
  reason: string;
  status: "Processed" | "In review" | "Rejected";
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IPlatformRefund>(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Processed", "In review", "Rejected"],
      default: "Processed",
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

refundSchema.index({ refundId: 1 });
refundSchema.index({ status: 1 });

const PlatformRefund: Model<IPlatformRefund> =
  mongoose.models.PlatformRefund ||
  mongoose.model<IPlatformRefund>("PlatformRefund", refundSchema);

export default PlatformRefund;
