import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAttributeValue {
  _id?: Types.ObjectId;
  value: string;
  status: "active" | "inactive";
}

export interface IAttribute extends Document {
  attributeCode: string;
  attributeName: string;
  displayType: "dropdown" | "radio" | "checkbox" | "text" | "color";
  values: IAttributeValue[];
  status: "active" | "inactive";
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const attributeValueSchema = new Schema<IAttributeValue>(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    _id: true,
  }
);

const attributeSchema = new Schema<IAttribute>(
  {
    attributeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    attributeName: {
      type: String,
      required: true,
      trim: true,
    },
    displayType: {
      type: String,
      enum: ["dropdown", "radio", "checkbox", "text", "color"],
      default: "dropdown",
    },
    values: {
      type: [attributeValueSchema],
      default: [],
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

attributeSchema.index({ attributeName: 1 });
attributeSchema.index({ status: 1 });

export const Attribute: Model<IAttribute> =
  (mongoose.models.AttributeMaster as Model<IAttribute>) ||
  mongoose.model<IAttribute>("AttributeMaster", attributeSchema);

export default Attribute;