import { Types } from "mongoose";
import { IUser } from "../../models/User";
export declare const ensureDefaultTeamUsers: () => Promise<void>;
export declare const getTeamUsers: (filters: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    counts: {
        label: string;
        value: number;
    }[];
    data: {
        id: any;
        name: string;
        firstName: any;
        lastName: any;
        email: any;
        role: any;
        roleId: any;
        warehouse: any;
        warehouseId: any;
        status: "Active" | "Invited" | "Suspended";
        initials: string;
        lastActive: string;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getUserById: (id: string) => Promise<import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const createTeamUser: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    warehouseId?: string;
    warehouseName?: string;
    sendInvite?: boolean;
}) => Promise<{
    id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
    warehouse: string;
    status: string;
    initials: string;
}>;
export declare const updateTeamUser: (id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    warehouseId?: string;
    warehouseName?: string;
    status?: string;
}) => Promise<import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updateUserStatus: (id: string, status: "Active" | "Suspended" | "Invited") => Promise<{
    id: Types.ObjectId;
    status: "Active" | "Invited" | "Suspended";
}>;
export declare const resendInvite: (id: string) => Promise<{
    message: string;
}>;
export declare const deleteTeamUser: (id: string) => Promise<{
    message: string;
}>;
