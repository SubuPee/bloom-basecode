import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

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

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    phone: {
      type: String,
      default: "+91 98200 41122",
    },
    location: {
      type: String,
      default: "Mumbai, India",
    },
    timezone: {
      type: String,
      default: "IST (UTC +5:30)",
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },
    warehouseName: {
      type: String,
      default: "All warehouses",
    },
    recoveryEmail: {
      type: String,
      default: "",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      default: () => new Date(),
    },
    activeSessions: [
      {
        id: { type: String, required: true },
        device: { type: String, required: true },
        place: { type: String, required: true },
        time: { type: String, required: true },
        current: { type: Boolean, default: false },
      },
    ],
    recentActivity: [
      {
        title: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("name").get(function (this: IUser) {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

// Virtual for initials
userSchema.virtual("initials").get(function (this: IUser) {
  const f = this.firstName?.[0] || "";
  const l = this.lastName?.[0] || "";
  return `${f}${l}`.toUpperCase() || "US";
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password || "");
};

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;
