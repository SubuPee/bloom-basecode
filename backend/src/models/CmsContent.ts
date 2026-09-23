import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICmsContent extends Document {
  slug: string;
  title: string;
  type: "Homepage banner" | "Editorial page" | "Policy page" | "Campaign" | "Content page";
  status: "Published" | "Draft" | "Archived";
  author: string;
  placement: string;
  summary: string;
  body?: string;
  visibility: string;
  version: number;
  tags?: string[];
  heroConfig?: {
    ctaText?: string;
    ctaLink?: string;
    badgeText?: string;
    backgroundTone?: string;
  };
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const cmsContentSchema = new Schema<ICmsContent>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Homepage banner",
        "Editorial page",
        "Policy page",
        "Campaign",
        "Content page",
      ],
      default: "Content page",
      index: true,
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Archived"],
      default: "Draft",
      index: true,
    },
    author: {
      type: String,
      default: "Alex Morgan",
      trim: true,
    },
    placement: {
      type: String,
      default: "Homepage · Hero",
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    body: {
      type: String,
      default: "",
    },
    visibility: {
      type: String,
      default: "All regions · Desktop & mobile",
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    heroConfig: {
      ctaText: { type: String, default: "Shop the edit", trim: true },
      ctaLink: { type: String, default: "/storefront", trim: true },
      badgeText: { type: String, default: "Seasonal Edit", trim: true },
      backgroundTone: { type: String, default: "bg-blue-soft text-blue", trim: true },
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

const CmsContent: Model<ICmsContent> =
  mongoose.models.CmsContent ||
  mongoose.model<ICmsContent>("CmsContent", cmsContentSchema);

export default CmsContent;
