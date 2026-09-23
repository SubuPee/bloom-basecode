export declare const getMovements: (filters: {
    search?: string;
    movementType?: string;
    vendorId?: string;
    warehouseId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: import("mongoose").Types.ObjectId;
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
export declare const getAuditHistory: (filters: {
    search?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: import("mongoose").Types.ObjectId;
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
export declare const getAdjustmentHistory: (filters: {
    page?: number;
    limit?: number;
}) => Promise<{
    data: (import("../../models/inventory/StockMovement").IStockMovement & Required<{
        _id: import("mongoose").Types.ObjectId;
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
