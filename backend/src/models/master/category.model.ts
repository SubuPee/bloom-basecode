import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  categoryCode: string;
  categoryName: string;
  parentCategory?: Types.ObjectId | null;
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    categoryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "CategoryMaster",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ categoryName: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ status: 1 });

export const Category: Model<ICategory> =
  (mongoose.models.CategoryMaster as Model<ICategory>) ||
  mongoose.model<ICategory>("CategoryMaster", categorySchema);

export default Category;