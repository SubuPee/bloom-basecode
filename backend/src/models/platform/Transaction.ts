import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPlatformTransaction extends Document {
  txnId: string;
  orderId: string;
  customer: string;
  method: "UPI" | "Card" | "Netbanking" | "COD" | "Wallet";
  amount: number;
  status: "Captured" | "Pending" | "Refunded" | "Failed";
  date: string;
  gateway: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<IPlatformTransaction>(
  {
    txnId: {
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
    method: {
      type: String,
      enum: ["UPI", "Card", "Netbanking", "COD", "Wallet"],
      default: "UPI",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Captured", "Pending", "Refunded", "Failed"],
      default: "Captured",
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    gateway: {
      type: String,
      default: "Razorpay",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ txnId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ customer: 1 });

const PlatformTransaction: Model<IPlatformTransaction> =
  mongoose.models.PlatformTransaction ||
  mongoose.model<IPlatformTransaction>("PlatformTransaction", transactionSchema);

export default PlatformTransaction;
