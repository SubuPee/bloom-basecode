import mongoose, { Document, Model } from "mongoose";
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
    billingAddress?: ICustomerAddress & {
        sameAsShipping?: boolean;
    };
    notes?: string;
    createdBy?: mongoose.Types.ObjectId | null;
    updatedBy?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const Customer: Model<ICustomer>;
export default Customer;
