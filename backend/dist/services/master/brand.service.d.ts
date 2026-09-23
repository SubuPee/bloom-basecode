export interface CreateBrandDto {
    brandCode: string;
    brandName: string;
    status?: "active" | "inactive";
}
export interface UpdateBrandDto {
    brandCode?: string;
    brandName?: string;
    status?: "active" | "inactive";
}
export interface GetBrandsQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
}
export declare const createBrand: (data: CreateBrandDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/brand.model").IBrand, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/brand.model").IBrand & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getBrands: (query?: GetBrandsQuery) => Promise<{
    brands: (import("../../models/master/brand.model").IBrand & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const getBrandById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/brand.model").IBrand, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/brand.model").IBrand & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateBrand: (id: string, data: UpdateBrandDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/brand.model").IBrand, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/brand.model").IBrand & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateBrandStatus: (id: string, status: string, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/brand.model").IBrand, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/brand.model").IBrand & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteBrand: (id: string) => Promise<boolean>;
declare const _default: {
    createBrand: typeof createBrand;
    getBrands: typeof getBrands;
    getBrandById: typeof getBrandById;
    updateBrand: typeof updateBrand;
    updateBrandStatus: typeof updateBrandStatus;
    deleteBrand: typeof deleteBrand;
};
export default _default;
