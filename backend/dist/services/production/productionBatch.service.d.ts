import { Types } from "mongoose";
import { BatchStatus } from "../../models/production/ProductionBatch";
export declare const getBatches: (filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    stats: {
        activeBatches: number;
        expiredBatches: number;
        quarantinedBatches: number;
        totalAvailable: number;
    };
    data: (import("../../models/production/ProductionBatch").IProductionBatch & Required<{
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
export declare const updateBatchStatus: (idOrBatchNumber: string, status: BatchStatus) => Promise<import("mongoose").Document<unknown, {}, import("../../models/production/ProductionBatch").IProductionBatch, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/production/ProductionBatch").IProductionBatch & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
