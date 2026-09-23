import mongoose, { Document, Model, Schema } from "mongoose";

// =====================================================
// WORKSPACE SETTINGS MODEL — Store identity, regional, & alert toggles
// =====================================================

export interface IWorkspaceSettings extends Document {
  storeDetails: {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    storefrontDomain: string;
  };
  regional: {
    currency: string;
    timezone: string;
    dateFormat: string;
    weightUnit: string;
  };
  notificationPreferences: {
    orders: boolean;
    stock: boolean;
    payouts: boolean;
    reviews: boolean;
    security: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSettingsSchema = new Schema<IWorkspaceSettings>(
  {
    storeDetails: {
      storeName: { type: String, default: "Bloom" },
      supportEmail: { type: String, default: "care@bloom.store" },
      supportPhone: { type: String, default: "+91 22 4000 1188" },
      storefrontDomain: { type: String, default: "bloom.store" },
    },
    regional: {
      currency: { type: String, default: "INR (₹)" },
      timezone: { type: String, default: "IST (UTC +5:30)" },
      dateFormat: { type: String, default: "DD MMM YYYY" },
      weightUnit: { type: String, default: "Kilogram" },
    },
    notificationPreferences: {
      orders: { type: Boolean, default: true },
      stock: { type: Boolean, default: true },
      payouts: { type: Boolean, default: true },
      reviews: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceSettings: Model<IWorkspaceSettings> =
  (mongoose.models.WorkspaceSettings as Model<IWorkspaceSettings>) ||
  mongoose.model<IWorkspaceSettings>("WorkspaceSettings", workspaceSettingsSchema);

export default WorkspaceSettings;
