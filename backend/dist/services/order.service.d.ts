import mongoose from "mongoose";
import { IOrder } from "../models/Order";
export declare const formatDateForUI: (date: Date | string) => string;
export declare const formatCurrencyINR: (amount: number) => string;
export declare const formatOrderResponse: (orderDoc: any) => any;
export declare const findOrderByIdOrIdentifier: (idOrIdentifier: string | number) => Promise<(mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null | undefined>;
export declare const seedOrdersIfEmpty: () => Promise<void>;
export interface GetOrdersQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    payment?: string;
    paymentStatus?: string;
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
}
export declare const getOrders: (query?: GetOrdersQuery) => Promise<{
    orders: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getOrderById: (idOrNumber: string | number) => Promise<any>;
export declare const createOrder: (data: any, user?: any) => Promise<any>;
export declare const updateOrderStatus: (idOrNumber: string | number, status: string, notes?: string, user?: any) => Promise<any>;
export declare const updatePaymentStatus: (idOrNumber: string | number, paymentStatus: string, notes?: string, user?: any) => Promise<any>;
export declare const bulkUpdateStatus: (ids: (string | number)[], status: string, notes?: string, user?: any) => Promise<{
    updatedCount: number;
    updatedOrderNumbers: any[];
    status: "Cancelled" | "Delivered" | "Processing" | "Returned" | "Shipped";
}>;
export declare const getOrderInvoice: (idOrNumber: string | number) => Promise<{
    invoiceNumber: string;
    orderNumber: string;
    issueDate: string;
    formattedDate: string;
    seller: {
        name: string;
        legalName: string;
        address: string;
        gstin: string;
        email: string;
        phone: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
        shippingAddress: import("../models/Order").IOrderAddress;
        billingAddress: import("../models/Order").IOrderAddress;
    };
    items: {
        index: number;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        formattedUnitPrice: string;
        formattedTotalPrice: string;
    }[];
    summary: {
        subtotal: number;
        shippingFee: number;
        tax: number;
        discount: number;
        totalAmount: number;
        formattedSubtotal: string;
        formattedShipping: string;
        formattedTax: string;
        formattedDiscount: string;
        formattedTotal: string;
    };
    payment: {
        status: "Failed" | "Paid" | "Pending" | "Refunded";
        method: string;
        date: string | null;
    };
    fulfillment: {
        status: "Cancelled" | "Delivered" | "Processing" | "Returned" | "Shipped";
        location: string;
        carrier: string | undefined;
        trackingNumber: string | undefined;
    };
}>;
export declare const getOrderStats: () => Promise<{
    cards: {
        label: string;
        value: number;
        detail: string;
        tone: string;
    }[];
    metrics: {
        totalOrders: number;
        processingOrders: number;
        inTransitOrders: number;
        deliveredOrders: number;
        returnedOrders: number;
        cancelledOrders: number;
        paidOrders: number;
        pendingOrders: number;
        refundedOrders: number;
        totalRevenue: any;
        formattedTotalRevenue: string;
        averageOrderValue: number;
        formattedAverageOrderValue: string;
    };
}>;
export declare const exportOrders: (format?: string, query?: GetOrdersQuery) => Promise<string | any[]>;
export declare const deleteOrder: (idOrNumber: string | number, user?: any) => Promise<{
    success: boolean;
    message: string;
    orderNumber: string;
}>;
declare const _default: {
    seedOrdersIfEmpty: typeof seedOrdersIfEmpty;
    getOrders: typeof getOrders;
    getOrderById: typeof getOrderById;
    createOrder: typeof createOrder;
    updateOrderStatus: typeof updateOrderStatus;
    updatePaymentStatus: typeof updatePaymentStatus;
    bulkUpdateStatus: typeof bulkUpdateStatus;
    getOrderInvoice: typeof getOrderInvoice;
    getOrderStats: typeof getOrderStats;
    exportOrders: typeof exportOrders;
    deleteOrder: typeof deleteOrder;
};
export default _default;
