import { IVendor } from "../models/Vendor";
export declare const logVendorAction: (user: string | undefined, action: string, entity: string, entityId: string, oldValue?: any, newValue?: any) => Promise<void>;
export declare const getNextVendorId: () => Promise<string>;
export declare const registerVendor: (data: any, actor?: string, userId?: any) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getRegistrations: ({ page, limit, search, status, kycStatus, businessType, }?: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    kycStatus?: string;
    businessType?: string;
}) => Promise<{
    vendors: any;
    pagination: {
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getVendorById: (id: string) => Promise<IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateVendorStatus: (id: string, { status, reason }: {
    status: string;
    reason?: string;
}, actor?: string) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateKycStatus: (id: string, { kycStatus, notes }: {
    kycStatus: string;
    notes?: string;
}, actor?: string) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const uploadDocument: (vendorId: string, file: Express.Multer.File | any, docData: any, actor?: string) => Promise<{
    id: string;
    type: any;
    documentNumber: any;
    fileName: any;
    fileSize: string;
    fileUrl: string;
    uploadedDate: string;
    expiryDate: any;
    status: "Pending";
    notes: any;
}>;
export declare const verifyDocument: (vendorId: string, docId: string, { status, notes }: {
    status: "Verified" | "Rejected" | "Pending";
    notes?: string;
}, actor?: string) => Promise<import("../models/Vendor").IVendorDocument>;
export declare const deleteDocument: (vendorId: string, docId: string, actor?: string) => Promise<boolean>;
export declare const updateVendorProfile: (id: string, data: any, actor?: string) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateCommission: (id: string, commissionRate: number | string, actor?: string) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const softDeleteVendor: (id: string, actor?: string) => Promise<boolean>;
export declare const getVendorOrders: (vendorId?: string, { status, page, limit, }?: {
    status?: string;
    page?: number | string;
    limit?: number | string;
}) => Promise<{
    orders: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const updateOrderStatus: (orderId: string, { status, carrier, trackingNumber, }: {
    status: string;
    carrier?: string;
    trackingNumber?: string;
}, actor?: string) => Promise<any>;
export declare const getVendorReturns: (vendorId?: string, { status, page, limit, }?: {
    status?: string;
    page?: number | string;
    limit?: number | string;
}) => Promise<{
    returns: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const inspectReturn: (returnId: string, { inspectionResult, dispositionAction, notes, }: {
    inspectionResult: string;
    dispositionAction: string;
    notes?: string;
}, actor?: string) => Promise<any>;
export declare const getVendorWallet: (vendorId: string) => Promise<{
    totalEarnings: any;
    totalCommission: any;
    totalRefunds: any;
    totalWithdrawals: any;
    totalSettled: any;
    availableBalance: number;
    pendingBalance: any;
}>;
export declare const getSettlements: (vendorId?: string, { paymentStatus, page, limit, }?: {
    paymentStatus?: string;
    page?: number | string;
    limit?: number | string;
}) => Promise<{
    settlements: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const generateSettlement: (vendorId: string, period: string, actor?: string) => Promise<any>;
export declare const approveSettlement: (settlementId: string, actor?: string) => Promise<{
    settlement: any;
    payment: any;
}>;
export declare const processPayment: (paymentId: string, { referenceId, method, notes, }: {
    referenceId: string;
    method?: string;
    notes?: string;
}, actor?: string) => Promise<{
    payment: any;
    settlement: any;
    transaction: any;
}>;
export declare const getTransactions: (vendorId?: string, { type, status, page, limit, }?: {
    type?: string;
    status?: string;
    page?: number | string;
    limit?: number | string;
}) => Promise<{
    transactions: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getDashboardStats: () => Promise<{
    totalVendors: number;
    activeVendors: number;
    pendingReview: number;
    totalGMV: any;
    totalCommission: any;
    pendingPayouts: number;
}>;
export declare const getActivityLogs: ({ vendorId, entity, limit, }?: {
    vendorId?: string;
    entity?: string;
    limit?: number | string;
}) => Promise<any[]>;
export declare const seedInitialVendorsIfEmpty: () => Promise<void>;
export declare const exportVendorsCsv: (query?: any) => Promise<string>;
export declare const updateVendorBankTax: (id: string, data: any, actor?: string) => Promise<import("mongoose").Document<unknown, {}, IVendor, {}, import("mongoose").DefaultSchemaOptions> & IVendor & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getVendorProducts: (vendorId: string, { page, limit, search, category, status, }?: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    category?: string;
    status?: string;
}) => Promise<{
    products: (import("../models/Product").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const createVendorProduct: (vendorId: string, productData: any, actor?: string) => Promise<import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
declare const _default: {
    registerVendor: typeof registerVendor;
    getRegistrations: typeof getRegistrations;
    getVendorById: typeof getVendorById;
    updateVendorStatus: typeof updateVendorStatus;
    updateKycStatus: typeof updateKycStatus;
    uploadDocument: typeof uploadDocument;
    verifyDocument: typeof verifyDocument;
    deleteDocument: typeof deleteDocument;
    updateVendorProfile: typeof updateVendorProfile;
    updateCommission: typeof updateCommission;
    softDeleteVendor: typeof softDeleteVendor;
    getVendorOrders: typeof getVendorOrders;
    updateOrderStatus: typeof updateOrderStatus;
    getVendorReturns: typeof getVendorReturns;
    inspectReturn: typeof inspectReturn;
    getVendorWallet: typeof getVendorWallet;
    getSettlements: typeof getSettlements;
    generateSettlement: typeof generateSettlement;
    approveSettlement: typeof approveSettlement;
    processPayment: typeof processPayment;
    getTransactions: typeof getTransactions;
    getDashboardStats: typeof getDashboardStats;
    getActivityLogs: typeof getActivityLogs;
    seedInitialVendorsIfEmpty: typeof seedInitialVendorsIfEmpty;
    exportVendorsCsv: typeof exportVendorsCsv;
    updateVendorBankTax: typeof updateVendorBankTax;
    getVendorProducts: typeof getVendorProducts;
    createVendorProduct: typeof createVendorProduct;
};
export default _default;
