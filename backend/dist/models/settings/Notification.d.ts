import { Document, Model, Types } from "mongoose";
export type NotificationType = "order" | "inventory" | "customer" | "system" | "payment";
export type NotificationPriority = "High" | "Medium" | "Low";
export interface INotification extends Document {
    notificationId: string;
    title: string;
    body: string;
    detail: string;
    type: NotificationType;
    priority: NotificationPriority;
    read: boolean;
    source: string;
    actor: string;
    link?: {
        label: string;
        to: string;
    };
    userId?: Types.ObjectId | null;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: Model<INotification>;
export default Notification;
