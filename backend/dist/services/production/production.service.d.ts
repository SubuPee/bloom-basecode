import { Types } from "mongoose";
export declare const getProductionOverview: () => Promise<{
    totalOrders: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
    cancelledOrdersCount: number;
    totalProduced: number;
    totalGood: number;
    totalRejected: number;
    yieldPercentage: number;
    activeOrders: (import("../../models/production/ProductionOrder").IProductionOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    recentBatches: (import("../../models/production/ProductionBatch").IProductionBatch & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare const getOrders: (filters: {
    search?: string;
    status?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    stats: {
        totalOrders: number;
        planned: number;
        inProgress: number;
        completed: number;
        cancelled: number;
    };
    data: (import("../../models/production/ProductionOrder").IProductionOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getOrderById: (orderId: string) => Promise<{
    order: import("../../models/production/ProductionOrder").IProductionOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    };
    relatedBatch: (import("../../models/production/ProductionBatch").IProductionBatch & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null;
}>;
export declare const createOrder: (payload: {
    productId: string;
    variantId: string;
    vendorId: string;
    batchNumber: string;
    plannedQuantity: number;
    unit: string;
    warehouseId: string;
    storageLocation?: string;
    expectedCompletion: string;
    notes?: string;
    rawMaterials?: Array<{
        name: string;
        requiredQuantity: number;
        unit: string;
        availableStock?: number;
    }>;
    createdBy: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../../models/production/ProductionOrder").IProductionOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionOrder").IProductionOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const startOrder: (orderId: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/production/ProductionOrder").IProductionOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionOrder").IProductionOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const completeOrder: (orderId: string, producedQuantity: number, rejectedQuantity: number, createdBy: string) => Promise<{
    order: import("mongoose").Document<unknown, {}, import("../../models/production/ProductionOrder").IProductionOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionOrder").IProductionOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    stock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    batch: import("mongoose").Document<unknown, {}, import("../../models/production/ProductionBatch").IProductionBatch, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionBatch").IProductionBatch & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const cancelOrder: (orderId: string, cancelReason: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/production/ProductionOrder").IProductionOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionOrder").IProductionOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getProductionHistory: (filters: {
    search?: string;
    vendorId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    stats: {
        totalCompleted: number;
        totalCancelled: number;
        totalProduced: number;
        totalGood: number;
        totalRejected: number;
        overallYieldRate: number;
    };
    data: (import("../../models/production/ProductionOrder").IProductionOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
