import { Types } from "mongoose";
export declare const getInventoryOverview: () => Promise<{
    availableStock: number;
    reservedStock: number;
    inTransitStock: number;
    damagedStock: number;
    expiredStock: number;
    categoryStockData: {
        name: string;
        available: number;
        reserved: number;
    }[];
    stockSplit: {
        name: string;
        value: number;
        color: string;
    }[];
    recentMovements: (import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare const getStockLedger: (filters: {
    search?: string;
    vendorId?: string;
    warehouseId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
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
export declare const addStock: (payload: {
    productId: string;
    variantId: string;
    warehouseId: string;
    vendorId?: string;
    sku?: string;
    unitCode?: string;
    quantity: number;
    batchNumber?: string;
    notes?: string;
    referenceId?: string;
    location?: string;
    createdBy: string;
}) => Promise<{
    stock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    movement: import("mongoose").Document<unknown, {}, import("../../models/inventory/StockMovement").IStockMovement, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const adjustStock: (payload: {
    productId: string;
    variantId: string;
    warehouseId: string;
    adjustmentType: "Increase" | "Decrease" | "Damage" | "Expiry";
    quantity: number;
    reason: string;
    notes: string;
    batchNumber?: string;
    createdBy: string;
}) => Promise<{
    stock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    movement: import("mongoose").Document<unknown, {}, import("../../models/inventory/StockMovement").IStockMovement, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const getLowStockItems: (filters: {
    search?: string;
    vendorId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
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
export declare const getOutOfStockItems: (filters: {
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    stats: {
        totalOutOfStockSkus: number;
        backorderUnits: number;
        vendorsImpacted: number;
    };
    data: (import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
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
