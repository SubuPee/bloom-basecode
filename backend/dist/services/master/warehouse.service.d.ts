export interface CreateWarehouseDto {
    warehouseCode: string;
    warehouseName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactPerson: string;
    contactPhone: string;
    email?: string;
    status?: "active" | "inactive";
}
export interface UpdateWarehouseDto {
    warehouseCode?: string;
    warehouseName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPerson?: string;
    contactPhone?: string;
    email?: string;
    status?: "active" | "inactive";
}
export interface GetWarehousesQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    city?: string;
    state?: string;
}
export declare const createWarehouse: (data: CreateWarehouseDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/warehouse.model").IWarehouse, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/warehouse.model").IWarehouse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getWarehouses: (query?: GetWarehousesQuery) => Promise<{
    warehouses: (import("../../models/master/warehouse.model").IWarehouse & Required<{
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
export declare const getWarehouseById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/warehouse.model").IWarehouse, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/warehouse.model").IWarehouse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateWarehouse: (id: string, data: UpdateWarehouseDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/warehouse.model").IWarehouse, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/warehouse.model").IWarehouse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateWarehouseStatus: (id: string, status: string, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/warehouse.model").IWarehouse, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/warehouse.model").IWarehouse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteWarehouse: (id: string) => Promise<boolean>;
declare const _default: {
    createWarehouse: typeof createWarehouse;
    getWarehouses: typeof getWarehouses;
    getWarehouseById: typeof getWarehouseById;
    updateWarehouse: typeof updateWarehouse;
    updateWarehouseStatus: typeof updateWarehouseStatus;
    deleteWarehouse: typeof deleteWarehouse;
};
export default _default;
