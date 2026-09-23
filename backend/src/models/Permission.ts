import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPermission extends Document {
  name: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "manage";
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "manage"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Permission: Model<IPermission> =
  (mongoose.models.Permission as Model<IPermission>) ||
  mongoose.model<IPermission>("Permission", permissionSchema);

export default Permission;
