import mongoose, { Document, Types } from "mongoose";
export interface IInventoryStock extends Document {
    productId: Types.ObjectId;
    variantId: string;
    warehouseId: Types.ObjectId;
    vendorId: Types.ObjectId;
    sku: string;
    unitCode: string;
    batchNumber: string;
    availableStock: number;
    reservedStock: number;
    inTransitStock: number;
    damagedStock: number;
    expiredStock: number;
    totalStock: number;
    minStock: number;
    reorderLevel: number;
    softDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InventoryStock: mongoose.Model<IInventoryStock, {}, {}, {}, Document<unknown, {}, IInventoryStock, {}, mongoose.DefaultSchemaOptions> & IInventoryStock & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInventoryStock>;
export default InventoryStock;
