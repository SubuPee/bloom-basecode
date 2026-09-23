import { Document, Model, Types } from "mongoose";
export interface ISubCategory extends Document {
    subCategoryCode: string;
    subCategoryName: string;
    category: Types.ObjectId | any;
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SubCategory: Model<ISubCategory>;
export default SubCategory;
