import { Document, Model, Types } from "mongoose";
export interface ICategory extends Document {
    categoryCode: string;
    categoryName: string;
    parentCategory?: Types.ObjectId | null;
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: Model<ICategory>;
export default Category;
