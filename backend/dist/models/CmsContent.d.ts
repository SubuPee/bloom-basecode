import mongoose, { Document, Model } from "mongoose";
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
declare const CmsContent: Model<ICmsContent>;
export default CmsContent;
