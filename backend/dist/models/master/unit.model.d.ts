import { Document, Model, Types } from "mongoose";
export interface IUnit extends Document {
    unitCode: string;
    unitName: string;
    symbol: string;
    unitType: "quantity" | "weight" | "length" | "volume" | "area";
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Unit: Model<IUnit>;
export default Unit;
