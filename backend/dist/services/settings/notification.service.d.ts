import { INotification } from "../../models/settings/Notification";
export declare const getNotifications: (filters: {
    search?: string;
    type?: string;
    priority?: string;
    read?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    unreadCount: number;
    total: number;
    data: {
        id: string;
        _id: import("mongoose").Types.ObjectId;
        title: string;
        body: string;
        detail: string;
        type: import("../../models/settings/Notification").NotificationType;
        priority: import("../../models/settings/Notification").NotificationPriority;
        read: boolean;
        source: string;
        actor: string;
        link: {
            label: string;
            to: string;
        } | undefined;
        date: string;
        time: string;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getNotificationById: (id: string) => Promise<{
    id: string;
    _id: import("mongoose").Types.ObjectId;
    title: string;
    body: string;
    detail: string;
    type: import("../../models/settings/Notification").NotificationType;
    priority: import("../../models/settings/Notification").NotificationPriority;
    read: boolean;
    source: string;
    actor: string;
    link: {
        label: string;
        to: string;
    } | undefined;
    date: string;
    time: string;
}>;
export declare const markNotificationRead: (id: string, read?: boolean) => Promise<import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const markAllNotificationsRead: () => Promise<{
    message: string;
}>;
export declare const archiveNotification: (id: string) => Promise<{
    message: string;
}>;
