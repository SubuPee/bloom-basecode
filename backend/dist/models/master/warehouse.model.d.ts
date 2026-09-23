import { Document, Model, Types } from "mongoose";
export interface IWarehouse extends Document {
    warehouseCode: string;
    warehouseName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    contactPhone: string;
    email: string;
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Warehouse: Model<IWarehouse>;
export default Warehouse;
