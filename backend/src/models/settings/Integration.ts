import mongoose, { Document, Model, Schema } from "mongoose";

// =====================================================
// INTEGRATION MODEL — Third-party service connectors
// =====================================================

export type IntegrationStatus = "Connected" | "Not connected";

export interface IIntegration extends Document {
  key: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  detail: string;
  config?: Record<string, any>;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Connected", "Not connected"],
      default: "Not connected",
      index: true,
    },
    detail: {
      type: String,
      default: "",
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Integration: Model<IIntegration> =
  (mongoose.models.Integration as Model<IIntegration>) ||
  mongoose.model<IIntegration>("Integration", integrationSchema);

export default Integration;
