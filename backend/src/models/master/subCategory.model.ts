import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISubCategory extends Document {
  subCategoryCode: string;
  subCategoryName: string;
  category: Types.ObjectId | any;
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    subCategoryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    subCategoryName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "CategoryMaster",
      required: true,
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

subCategorySchema.index({ subCategoryName: 1 });
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ status: 1 });

export const SubCategory: Model<ISubCategory> =
  (mongoose.models.SubCategoryMaster as Model<ISubCategory>) ||
  mongoose.model<ISubCategory>("SubCategoryMaster", subCategorySchema);

export default SubCategory;