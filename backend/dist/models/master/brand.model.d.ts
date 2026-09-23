import { Document, Model, Types } from "mongoose";
export interface IBrand extends Document {
    brandCode: string;
    brandName: string;
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Brand: Model<IBrand>;
export default Brand;
