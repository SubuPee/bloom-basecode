import mongoose from "mongoose";
import { ISubCategory } from "../../models/master/subCategory.model";
export interface CreateSubCategoryDto {
    subCategoryCode: string;
    subCategoryName: string;
    category: string;
    status?: "active" | "inactive";
}
export interface UpdateSubCategoryDto {
    subCategoryCode?: string;
    subCategoryName?: string;
    category?: string;
    status?: "active" | "inactive";
}
export interface GetSubCategoriesParams {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    category?: string;
}
export declare const createSubCategory: (data: CreateSubCategoryDto, userId?: string) => Promise<(mongoose.Document<unknown, {}, ISubCategory, {}, mongoose.DefaultSchemaOptions> & ISubCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const getSubCategories: ({ page, limit, search, status, category, }?: GetSubCategoriesParams) => Promise<{
    subCategories: (mongoose.Document<unknown, {}, ISubCategory, {}, mongoose.DefaultSchemaOptions> & ISubCategory & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}>;
export declare const getSubCategoryById: (subCategoryId: string) => Promise<mongoose.Document<unknown, {}, ISubCategory, {}, mongoose.DefaultSchemaOptions> & ISubCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateSubCategory: (subCategoryId: string, data: UpdateSubCategoryDto, userId?: string) => Promise<(mongoose.Document<unknown, {}, ISubCategory, {}, mongoose.DefaultSchemaOptions> & ISubCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const updateSubCategoryStatus: (subCategoryId: string, status: string, userId?: string) => Promise<(mongoose.Document<unknown, {}, ISubCategory, {}, mongoose.DefaultSchemaOptions> & ISubCategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const deleteSubCategory: (subCategoryId: string) => Promise<boolean>;
declare const _default: {
    createSubCategory: typeof createSubCategory;
    getSubCategories: typeof getSubCategories;
    getSubCategoryById: typeof getSubCategoryById;
    updateSubCategory: typeof updateSubCategory;
    updateSubCategoryStatus: typeof updateSubCategoryStatus;
    deleteSubCategory: typeof deleteSubCategory;
};
export default _default;
