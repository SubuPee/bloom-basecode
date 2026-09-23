import mongoose from "mongoose";
import { ICustomer } from "../models/Customer";
export interface CustomerQueryParams {
    page?: number | string;
    limit?: number | string;
    search?: string;
    segment?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface CustomerStatsResponse {
    totalCustomers: string;
    totalCustomersTrend: string;
    newThisMonth: string;
    newThisMonthTrend: string;
    returningShare: string;
    returningTrend: string;
    lifetimeValue: string;
    lifetimeValueTrend: string;
    raw: {
        totalCustomers: number;
        newThisMonth: number;
        returningShare: number;
        averageLTV: number;
    };
    stats: Array<{
        label: string;
        value: string;
        trend: string;
        icon: string;
        tone: string;
    }>;
    statsTuples: Array<[string, string, string, string, string]>;
}
export interface CustomerUIFormat {
    id: string;
    _id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: string;
    rawSpent: number;
    segment: "VIP" | "Returning" | "New" | "At risk";
    city: string;
    status: "Active" | "Inactive";
    joined: string;
    avatarInitials: string;
    avatarTone: string;
    preferences?: {
        deliveryPreference?: string;
        reviewCount?: number;
        favoriteCategory?: string;
    };
    shippingAddress?: {
        fullAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    billingAddress?: {
        sameAsShipping?: boolean;
        fullAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const formatCurrencyINR: (amount?: number) => string;
export declare const formatJoinedDate: (date?: Date | string) => string;
export declare const getAvatarInitials: (name?: string) => string;
export declare const formatCustomerForUI: (doc: any, index?: number) => CustomerUIFormat;
export declare const getCustomerStats: () => Promise<CustomerStatsResponse>;
export declare const getCustomers: (query?: CustomerQueryParams) => Promise<{
    items: CustomerUIFormat[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}>;
export declare const findCustomerByIdOrCode: (idOrCode: string) => Promise<(mongoose.Document<unknown, {}, ICustomer, {}, mongoose.DefaultSchemaOptions> & ICustomer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const getCustomerById: (idOrCode: string) => Promise<{
    id: string;
    _id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: string;
    rawSpent: number;
    segment: "VIP" | "Returning" | "New" | "At risk";
    city: string;
    status: "Active" | "Inactive";
    joined: string;
    avatarInitials: string;
    avatarTone: string;
    preferences?: {
        deliveryPreference?: string;
        reviewCount?: number;
        favoriteCategory?: string;
    };
    shippingAddress?: {
        fullAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    billingAddress?: {
        sameAsShipping?: boolean;
        fullAddress?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    average: string;
    orderHistory: {
        id: any;
        _id: string;
        date: string;
        items: string;
        products: any;
        total: string;
        rawTotal: any;
        status: any;
        paymentStatus: any;
        address: any;
    }[];
    ordersTotalCount: number;
} | null>;
export declare const getCustomerOrders: (idOrCode: string, query?: {
    page?: number | string;
    limit?: number | string;
}) => Promise<{
    customer: {
        id: string;
        name: string;
        email: string;
    };
    items: {
        id: any;
        _id: string;
        orderNumber: any;
        date: string;
        itemsCount: any;
        itemsSummary: string;
        products: any;
        total: string;
        rawTotal: any;
        status: any;
        paymentStatus: any;
        paymentMethod: any;
    }[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
} | null>;
export declare const generateNextCustomerCode: () => Promise<string>;
export declare const createCustomer: (data: any, userId?: string) => Promise<CustomerUIFormat>;
export declare const updateCustomer: (idOrCode: string, data: any, userId?: string) => Promise<CustomerUIFormat | null>;
export declare const deleteCustomer: (idOrCode: string) => Promise<{
    deleted: boolean;
    id: string;
    name: string;
    email: string;
} | null>;
export declare const exportCustomers: (query?: CustomerQueryParams, format?: "csv" | "json") => Promise<string | {
    totalCustomers: number;
    exportedAt: string;
    customers: CustomerUIFormat[];
}>;
declare const _default: {
    getCustomerStats: typeof getCustomerStats;
    getCustomers: typeof getCustomers;
    getCustomerById: typeof getCustomerById;
    getCustomerOrders: typeof getCustomerOrders;
    createCustomer: typeof createCustomer;
    updateCustomer: typeof updateCustomer;
    deleteCustomer: typeof deleteCustomer;
    exportCustomers: typeof exportCustomers;
    formatCustomerForUI: typeof formatCustomerForUI;
};
export default _default;
