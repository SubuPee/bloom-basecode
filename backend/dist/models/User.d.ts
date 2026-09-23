import { Document, Model, Types } from "mongoose";
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: Types.ObjectId | any;
    status: "active" | "inactive" | "suspended";
    phone?: string;
    location?: string;
    timezone?: string;
    warehouseId?: Types.ObjectId | null;
    warehouseName?: string;
    recoveryEmail?: string;
    twoFactorEnabled?: boolean;
    passwordChangedAt?: Date;
    activeSessions?: Array<{
        id: string;
        device: string;
        place: string;
        time: string;
        current: boolean;
    }>;
    recentActivity?: Array<{
        title: string;
        time: string;
    }>;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    initials: string;
    comparePassword(enteredPassword: string): Promise<boolean>;
}
export declare const User: Model<IUser>;
export default User;
