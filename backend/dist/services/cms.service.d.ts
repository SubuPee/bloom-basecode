import mongoose from "mongoose";
import { ICmsContent } from "../models/CmsContent";
export interface CmsQueryParams {
    page?: number | string;
    limit?: number | string;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface CmsStatsResponse {
    publishedPages: string;
    activeCampaigns: string;
    reusableSections: string;
    raw: {
        publishedPages: number;
        activeCampaigns: number;
        reusableSections: number;
        totalEntries: number;
    };
    stats: Array<{
        label: string;
        value: string;
        icon: string;
        tone: string;
    }>;
    statsTuples: Array<[string, string, string, string]>;
}
export interface CmsUIFormat {
    id: string;
    _id: string;
    title: string;
    type: string;
    status: "Published" | "Draft" | "Archived";
    author: string;
    placement: string;
    summary: string;
    body?: string;
    visibility: string;
    version: number;
    updated: string;
    created: string;
    slug: string;
    tags: string[];
    heroConfig?: {
        ctaText?: string;
        ctaLink?: string;
        badgeText?: string;
        backgroundTone?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const slugify: (text: string) => string;
export declare const formatCmsDate: (date?: Date | string) => string;
export declare const formatCmsForUI: (doc: any) => CmsUIFormat;
export declare const seedCmsIfEmpty: () => Promise<void>;
export declare const getCmsStats: () => Promise<CmsStatsResponse>;
export declare const getCmsEntries: (query?: CmsQueryParams) => Promise<{
    items: CmsUIFormat[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}>;
export declare const findCmsByIdOrSlug: (idOrSlug: string) => Promise<(mongoose.Document<unknown, {}, ICmsContent, {}, mongoose.DefaultSchemaOptions> & ICmsContent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const getCmsEntryById: (idOrSlug: string) => Promise<CmsUIFormat | null>;
export declare const getStorefrontHero: () => Promise<CmsUIFormat | null>;
export declare const createCmsEntry: (data: any, userId?: string) => Promise<CmsUIFormat>;
export declare const updateCmsEntry: (idOrSlug: string, data: any, userId?: string) => Promise<CmsUIFormat | null>;
export declare const deleteCmsEntry: (idOrSlug: string) => Promise<{
    deleted: boolean;
    id: string;
    title: string;
} | null>;
declare const _default: {
    seedCmsIfEmpty: typeof seedCmsIfEmpty;
    getCmsStats: typeof getCmsStats;
    getCmsEntries: typeof getCmsEntries;
    getCmsEntryById: typeof getCmsEntryById;
    getStorefrontHero: typeof getStorefrontHero;
    createCmsEntry: typeof createCmsEntry;
    updateCmsEntry: typeof updateCmsEntry;
    deleteCmsEntry: typeof deleteCmsEntry;
    formatCmsForUI: typeof formatCmsForUI;
};
export default _default;
