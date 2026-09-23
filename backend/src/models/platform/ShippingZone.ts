import mongoose, { Document, Schema, Model } from "mongoose";

export interface IShippingZone extends Document {
  zone: string;
  rate: string;
  eta: string;
  partners: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shippingZoneSchema = new Schema<IShippingZone>(
  {
    zone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    rate: {
      type: String,
      required: true,
      trim: true,
    },
    eta: {
      type: String,
      required: true,
      trim: true,
    },
    partners: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShippingZone: Model<IShippingZone> =
  mongoose.models.ShippingZone ||
  mongoose.model<IShippingZone>("ShippingZone", shippingZoneSchema);

export default ShippingZone;
