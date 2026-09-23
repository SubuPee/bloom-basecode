import { Document, Model, Types } from "mongoose";
export interface IRole extends Document {
    name: string;
    description: string;
    scope: string;
    modulePermissions: Record<string, string[]>;
    permissions: (Types.ObjectId | any)[];
    isSystemRole: boolean;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Role: Model<IRole>;
export default Role;
