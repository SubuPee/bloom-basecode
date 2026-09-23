import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPlatformReview extends Document {
  reviewId: string;
  product: string;
  customer: string;
  rating: number;
  text: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IPlatformReview>(
  {
    reviewId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
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

reviewSchema.index({ reviewId: 1 });
reviewSchema.index({ status: 1 });

const PlatformReview: Model<IPlatformReview> =
  mongoose.models.PlatformReview ||
  mongoose.model<IPlatformReview>("PlatformReview", reviewSchema);

export default PlatformReview;
