import mongoose from "mongoose";
import { ICategory } from "../../models/master/category.model";
export interface CreateCategoryDto {
    categoryCode: string;
    categoryName: string;
    parentCategory?: string | null;
    status?: "active" | "inactive";
}
export interface UpdateCategoryDto {
    categoryCode?: string;
    categoryName?: string;
    parentCategory?: string | null;
    status?: "active" | "inactive";
}
export interface GetCategoriesParams {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    parentCategory?: string | null;
}
export declare const createCategory: (data: CreateCategoryDto, userId?: string) => Promise<(mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const getCategories: ({ page, limit, search, status, parentCategory, }?: GetCategoriesParams) => Promise<{
    categories: (mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
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
export declare const getCategoryById: (categoryId: string) => Promise<mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateCategory: (categoryId: string, data: UpdateCategoryDto, userId?: string) => Promise<(mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const updateCategoryStatus: (categoryId: string, status: string, userId?: string) => Promise<mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteCategory: (categoryId: string) => Promise<boolean>;
declare const _default: {
    createCategory: typeof createCategory;
    getCategories: typeof getCategories;
    getCategoryById: typeof getCategoryById;
    updateCategory: typeof updateCategory;
    updateCategoryStatus: typeof updateCategoryStatus;
    deleteCategory: typeof deleteCategory;
};
export default _default;
