import mongoose, { Document, Model } from "mongoose";
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
export interface IOrderTimelineStep {
    step: string;
    timestamp: Date;
    description?: string;
    completed: boolean;
}
export interface IOrderAddress {
    fullAddress: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
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
declare const Order: Model<IOrder>;
export default Order;
