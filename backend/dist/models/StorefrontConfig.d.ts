import mongoose, { Document, Model } from "mongoose";
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
declare const StorefrontConfig: Model<IStorefrontConfig>;
export default StorefrontConfig;
