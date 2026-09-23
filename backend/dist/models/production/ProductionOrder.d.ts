import mongoose, { Document, Types } from "mongoose";
export type ProductionStatus = "Planned" | "In Progress" | "Partially Completed" | "Completed" | "Cancelled";
export interface IRawMaterial {
    name: string;
    requiredQuantity: number;
    unit: string;
    availableStock: number;
}
export interface IProductionOrder extends Document {
    orderId: string;
    productId: Types.ObjectId;
    variantId: string;
    vendorId: Types.ObjectId;
    batchNumber: string;
    plannedQuantity: number;
    producedQuantity: number;
    goodQuantity: number;
    rejectedQuantity: number;
    unit: string;
    status: ProductionStatus;
    warehouseId: Types.ObjectId;
    storageLocation: string;
    expectedCompletion: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    notes: string;
    rawMaterials: IRawMaterial[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductionOrder: mongoose.Model<IProductionOrder, {}, {}, {}, Document<unknown, {}, IProductionOrder, {}, mongoose.DefaultSchemaOptions> & IProductionOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProductionOrder>;
export default ProductionOrder;
