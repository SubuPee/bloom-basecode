import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICustomerAddress {
  fullAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ICustomerPreferences {
  deliveryPreference?: string;
  reviewCount?: number;
  favoriteCategory?: string;
}

export interface ICustomer extends Document {
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  segment: "VIP" | "Returning" | "New" | "At risk";
  city: string;
  address?: string;
  status: "Active" | "Inactive";
  joinedDate?: Date;
  preferences?: ICustomerPreferences;
  shippingAddress?: ICustomerAddress;
  billingAddress?: ICustomerAddress & { sameAsShipping?: boolean };
  notes?: string;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    ordersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    segment: {
      type: String,
      enum: ["VIP", "Returning", "New", "At risk"],
      default: "New",
      index: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      deliveryPreference: {
        type: String,
        default: "Prefers standard delivery",
        trim: true,
      },
      reviewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      favoriteCategory: {
        type: String,
        default: "Electronics",
        trim: true,
      },
    },
    shippingAddress: {
      fullAddress: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      postalCode: { type: String, default: "", trim: true },
      country: { type: String, default: "India", trim: true },
    },
    billingAddress: {
      sameAsShipping: { type: Boolean, default: true },
      fullAddress: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      postalCode: { type: String, default: "", trim: true },
      country: { type: String, default: "India", trim: true },
    },
    notes: {
      type: String,
      default: "",
      trim: true,
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

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
