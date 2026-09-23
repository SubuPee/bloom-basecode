import { Document, Model } from "mongoose";
export interface IPermission extends Document {
    name: string;
    resource: string;
    action: "create" | "read" | "update" | "delete" | "manage";
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Permission: Model<IPermission>;
export default Permission;
