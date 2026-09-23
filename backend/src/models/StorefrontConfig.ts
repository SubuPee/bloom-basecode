import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStorefrontHighlight {
  icon: string;
  title: string;
  text: string;
}

export interface IStorefrontConfig extends Document {
  storeName: string;
  storeDomain: string;
  liveUrl: string;
  heroSlug: string;
  highlights: IStorefrontHighlight[];
  announcement?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const storefrontConfigSchema = new Schema<IStorefrontConfig>(
  {
    storeName: {
      type: String,
      default: "bloom.store",
      trim: true,
    },
    storeDomain: {
      type: String,
      default: "bloom.store",
      trim: true,
    },
    liveUrl: {
      type: String,
      default: "https://bloom.store",
      trim: true,
    },
    heroSlug: {
      type: String,
      default: "home-banner",
      trim: true,
    },
    highlights: [
      {
        icon: { type: String, default: "Truck", trim: true },
        title: { type: String, default: "Free delivery", trim: true },
        text: { type: String, default: "On all orders above ₹999", trim: true },
      },
    ],
    announcement: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "", trim: true },
      link: { type: String, default: "", trim: true },
    },
    seo: {
      metaTitle: {
        type: String,
        default: "Bloom — Thoughtful Modern E-Commerce",
        trim: true,
      },
      metaDescription: {
        type: String,
        default:
          "Discover curated collections of elevated lifestyle essentials, apparel, and home goods.",
        trim: true,
      },
      ogImage: { type: String, default: "", trim: true },
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

const StorefrontConfig: Model<IStorefrontConfig> =
  mongoose.models.StorefrontConfig ||
  mongoose.model<IStorefrontConfig>("StorefrontConfig", storefrontConfigSchema);

export default StorefrontConfig;
