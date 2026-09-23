import mongoose, { Document, Types } from "mongoose";
export type BatchStatus = "Active" | "Consumed" | "Expired" | "Quarantined";
export interface IProductionBatch extends Document {
    batchNumber: string;
    productionOrderId: Types.ObjectId;
    productId: Types.ObjectId;
    variantId: string;
    vendorId: Types.ObjectId;
    totalQuantity: number;
    availableQuantity: number;
    status: BatchStatus;
    warehouseId: Types.ObjectId;
    location: string;
    manufacturingDate: Date;
    expiryDate?: Date;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductionBatch: mongoose.Model<IProductionBatch, {}, {}, {}, Document<unknown, {}, IProductionBatch, {}, mongoose.DefaultSchemaOptions> & IProductionBatch & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProductionBatch>;
export default ProductionBatch;
