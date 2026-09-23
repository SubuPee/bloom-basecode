import mongoose, { Document, Types } from "mongoose";
export type TransferStatus = "Pending" | "In Transit" | "Completed" | "Cancelled";
export interface IStockTransfer extends Document {
    transferId: string;
    productId: Types.ObjectId;
    variantId: string;
    fromWarehouseId: Types.ObjectId;
    toWarehouseId: Types.ObjectId;
    quantity: number;
    status: TransferStatus;
    batchNumber: string;
    notes: string;
    dispatchedAt?: Date;
    receivedAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StockTransfer: mongoose.Model<IStockTransfer, {}, {}, {}, Document<unknown, {}, IStockTransfer, {}, mongoose.DefaultSchemaOptions> & IStockTransfer & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStockTransfer>;
export default StockTransfer;
