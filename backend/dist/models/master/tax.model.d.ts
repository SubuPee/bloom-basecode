import { Document, Model, Types } from "mongoose";
export interface ITax extends Document {
    taxCode: string;
    taxName: string;
    taxRate: number;
    taxType: "percentage" | "fixed";
    description: string;
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Tax: Model<ITax>;
export default Tax;
