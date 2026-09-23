export interface CreateUnitDto {
    unitCode: string;
    unitName: string;
    symbol: string;
    unitType: string;
    status?: "active" | "inactive";
}
export interface UpdateUnitDto {
    unitCode?: string;
    unitName?: string;
    symbol?: string;
    unitType?: string;
    status?: "active" | "inactive";
}
export interface GetUnitsQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    unitType?: string;
}
export declare const createUnit: (data: CreateUnitDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/unit.model").IUnit, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/unit.model").IUnit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getUnits: (query?: GetUnitsQuery) => Promise<{
    units: (import("../../models/master/unit.model").IUnit & Required<{
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
export declare const getUnitById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/unit.model").IUnit, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/unit.model").IUnit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateUnit: (id: string, data: UpdateUnitDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/unit.model").IUnit, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/unit.model").IUnit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateUnitStatus: (id: string, status: string, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/unit.model").IUnit, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/unit.model").IUnit & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteUnit: (id: string) => Promise<boolean>;
declare const _default: {
    createUnit: typeof createUnit;
    getUnits: typeof getUnits;
    getUnitById: typeof getUnitById;
    updateUnit: typeof updateUnit;
    updateUnitStatus: typeof updateUnitStatus;
    deleteUnit: typeof deleteUnit;
};
export default _default;
