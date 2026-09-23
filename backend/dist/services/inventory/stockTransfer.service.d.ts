import { Types } from "mongoose";
export declare const createTransfer: (payload: {
    productId: string;
    variantId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    batchNumber?: string;
    notes?: string;
    createdBy: string;
}) => Promise<{
    transfer: import("mongoose").Document<unknown, {}, import("../../models/inventory/StockTransfer").IStockTransfer, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/StockTransfer").IStockTransfer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    sourceStock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    destStock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const receiveTransfer: (transferId: string, createdBy: string) => Promise<{
    transfer: import("mongoose").Document<unknown, {}, import("../../models/inventory/StockTransfer").IStockTransfer, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/StockTransfer").IStockTransfer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    destStock: import("mongoose").Document<unknown, {}, import("../../models/inventory/InventoryStock").IInventoryStock, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/InventoryStock").IInventoryStock & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const cancelTransfer: (transferId: string, cancelReason: string, createdBy: string) => Promise<{
    transfer: import("mongoose").Document<unknown, {}, import("../../models/inventory/StockTransfer").IStockTransfer, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/inventory/StockTransfer").IStockTransfer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
}>;
export declare const getTransfers: (filters: {
    status?: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/StockTransfer").IStockTransfer & Required<{
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
