export interface CreateAttributeDto {
    attributeCode: string;
    attributeName: string;
    displayType?: "dropdown" | "radio" | "checkbox" | "text" | "color" | string;
    values?: Array<{
        value: string;
        status?: "active" | "inactive";
    }>;
    status?: "active" | "inactive";
}
export interface UpdateAttributeDto {
    attributeCode?: string;
    attributeName?: string;
    displayType?: "dropdown" | "radio" | "checkbox" | "text" | "color" | string;
    values?: Array<{
        value: string;
        status?: "active" | "inactive";
    }>;
    status?: "active" | "inactive";
}
export interface GetAttributesQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    displayType?: string;
}
export declare const createAttribute: (data: CreateAttributeDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/attribute.model").IAttribute, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/attribute.model").IAttribute & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getAttributes: (query?: GetAttributesQuery) => Promise<{
    attributes: (import("../../models/master/attribute.model").IAttribute & Required<{
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
export declare const getAttributeById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/attribute.model").IAttribute, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/attribute.model").IAttribute & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateAttribute: (id: string, data: UpdateAttributeDto, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/attribute.model").IAttribute, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/attribute.model").IAttribute & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateAttributeStatus: (id: string, status: string, user?: any) => Promise<import("mongoose").Document<unknown, {}, import("../../models/master/attribute.model").IAttribute, {}, import("mongoose").DefaultSchemaOptions> & import("../../models/master/attribute.model").IAttribute & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteAttribute: (id: string) => Promise<boolean>;
declare const _default: {
    createAttribute: typeof createAttribute;
    getAttributes: typeof getAttributes;
    getAttributeById: typeof getAttributeById;
    updateAttribute: typeof updateAttribute;
    updateAttributeStatus: typeof updateAttributeStatus;
    deleteAttribute: typeof deleteAttribute;
};
export default _default;
