import mongoose, { Document, Model, Schema, Types } from "mongoose";

// =====================================================
// NOTIFICATION MODEL — Workspace alerts and notifications
// =====================================================

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

const notificationSchema = new Schema<INotification>(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["order", "inventory", "customer", "system", "payment"],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      label: { type: String },
      to: { type: String },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
