export interface CreateTaxDto {
    taxCode: string;
    taxName: string;
    taxRate: number;
    taxType: string;
    description?: string;
    status?: "active" | "inactive";
}
export interface UpdateTaxDto {
    taxCode?: string;
    taxName?: string;
    taxRate?: number;
    taxType?: string;
    description?: string;
    status?: "active" | "inactive";
}
export interface GetTaxesQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    taxType?: string;
}
export declare const createTax: (data: CreateTaxDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/tax.model").ITax, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/tax.model").ITax & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getTaxes: (query?: GetTaxesQuery) => Promise<{
    taxes: (import("../../models/master/tax.model").ITax & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getTaxById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/tax.model").ITax, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/tax.model").ITax & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateTax: (id: string, data: UpdateTaxDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/tax.model").ITax, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/tax.model").ITax & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateTaxStatus: (id: string, status: string, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/tax.model").ITax, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/tax.model").ITax & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteTax: (id: string) => Promise<boolean>;
declare const _default: {
    createTax: typeof createTax;
    getTaxes: typeof getTaxes;
    getTaxById: typeof getTaxById;
    updateTax: typeof updateTax;
    updateTaxStatus: typeof updateTaxStatus;
    deleteTax: typeof deleteTax;
};
export default _default;
