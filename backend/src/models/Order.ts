import mongoose, { Document, Model, Schema } from "mongoose";

// =====================================================
// ORDER ITEM INTERFACE & SCHEMA
// =====================================================

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId | string | null;
  productCode?: string;
  productName: string;
  variantId?: string;
  sku?: string;
  image?: string;
  category?: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productCode: {
      type: String,
      default: "",
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    variantId: {
      type: String,
      default: "",
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: true }
);

// =====================================================
// TIMELINE STEP INTERFACE & SCHEMA
// =====================================================

export interface IOrderTimelineStep {
  step: string;
  timestamp: Date;
  description?: string;
  completed: boolean;
}

const timelineStepSchema = new Schema<IOrderTimelineStep>(
  {
    step: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// =====================================================
// ORDER ADDRESS INTERFACE & SCHEMA
// =====================================================

export interface IOrderAddress {
  fullAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: { type: String, default: "", trim: true },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { _id: false }
);

// =====================================================
// ORDER INTERFACE & MAIN SCHEMA
// =====================================================

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId | string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerSegment?: string;
  items: IOrderItem[];
  totalQuantity: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  paymentMethod: string;
  paymentDate?: Date | null;
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Returned" | "Cancelled";
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  fulfillmentLocation: string;
  carrier?: string;
  trackingNumber?: string;
  timeline: IOrderTimelineStep[];
  customerNotes?: string;
  internalNotes?: string;
  source: string;
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    customerSegment: {
      type: String,
      default: "Returning",
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded", "Failed"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "Credit Card",
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Returned", "Cancelled"],
      default: "Processing",
      index: true,
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: orderAddressSchema,
      default: null,
    },
    fulfillmentLocation: {
      type: String,
      default: "Mumbai Central",
      trim: true,
    },
    carrier: {
      type: String,
      default: "BlueDart Express",
      trim: true,
    },
    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },
    timeline: {
      type: [timelineStepSchema],
      default: [],
    },
    customerNotes: {
      type: String,
      default: "",
      trim: true,
    },
    internalNotes: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "web_storefront",
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

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
