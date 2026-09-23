import { Types } from "mongoose";
export declare const getUserProfile: (userId: string) => Promise<{
    id: Types.ObjectId;
    name: string;
    firstName: string;
    lastName: string;
    initials: string;
    email: string;
    role: any;
    roleScope: any;
    status: string;
    phone: string;
    location: string;
    timezone: string;
    warehouse: string;
    recoveryEmail: string;
    twoFactorEnabled: boolean;
    passwordChangedAgo: string;
    stats: {
        label: string;
        value: string;
        icon: string;
        tone: string;
    }[];
    recentActivity: {
        title: string;
        time: string;
    }[];
    activeSessions: {
        id: string;
        device: string;
        place: string;
        time: string;
        current: boolean;
    }[];
}>;
export declare const updateUserProfile: (userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    recoveryEmail?: string;
    twoFactorEnabled?: boolean;
}) => Promise<{
    id: Types.ObjectId;
    name: string;
    firstName: string;
    lastName: string;
    initials: string;
    email: string;
    role: any;
    roleScope: any;
    status: string;
    phone: string;
    location: string;
    timezone: string;
    warehouse: string;
    recoveryEmail: string;
    twoFactorEnabled: boolean;
    passwordChangedAgo: string;
    stats: {
        label: string;
        value: string;
        icon: string;
        tone: string;
    }[];
    recentActivity: {
        title: string;
        time: string;
    }[];
    activeSessions: {
        id: string;
        device: string;
        place: string;
        time: string;
        current: boolean;
    }[];
}>;
export declare const changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<{
    message: string;
}>;
export declare const revokeSession: (userId: string, sessionId: string) => Promise<{
    id: string;
    device: string;
    place: string;
    time: string;
    current: boolean;
}[]>;
