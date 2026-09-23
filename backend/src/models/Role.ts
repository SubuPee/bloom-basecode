import mongoose, { Document, Model, Schema, Types } from "mongoose";

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

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    scope: {
      type: String,
      default: "Custom",
    },
    modulePermissions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Role: Model<IRole> =
  (mongoose.models.Role as Model<IRole>) || mongoose.model<IRole>("Role", roleSchema);

export default Role;
