import mongoose, { Document, Types } from "mongoose";
export type MovementType = "Opening Stock" | "Purchase" | "Production" | "Order" | "Order Cancellation" | "Return" | "Damage" | "Expiry" | "Adjustment" | "Transfer In" | "Transfer Out" | "Manual Addition" | "Manual Deduction";
export interface IStockMovement extends Document {
    movementId: string;
    productId: Types.ObjectId;
    variantId: string;
    warehouseId: Types.ObjectId;
    vendorId?: Types.ObjectId;
    movementType: MovementType;
    referenceId: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    batchNumber: string;
    location: string;
    notes: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
}
export declare const StockMovement: mongoose.Model<IStockMovement, {}, {}, {}, Document<unknown, {}, IStockMovement, {}, mongoose.DefaultSchemaOptions> & IStockMovement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStockMovement>;
export default StockMovement;
