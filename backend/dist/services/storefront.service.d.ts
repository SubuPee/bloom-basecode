import { IStorefrontConfig } from "../models/StorefrontConfig";
export interface StorefrontProductCard {
    id: string;
    _id: string;
    productCode: string;
    name: string;
    category: string;
    sellingPrice: number;
    sellingPriceFormatted: string;
    mrp: number;
    mrpFormatted: string;
    hasDiscount: boolean;
    discountPercentage: number;
    image: string;
    rating: number;
    reviewsCount: number;
    isPublished: boolean;
    isFeatured: boolean;
    inStock: boolean;
}
export interface StorefrontPreviewResponse {
    store: {
        name: string;
        domain: string;
        liveUrl: string;
        description: string;
    };
    hero: {
        id: string;
        title: string;
        type: string;
        summary: string;
        badgeText: string;
        ctaText: string;
        ctaLink: string;
        editLink: string;
        imageUrl: string;
    };
    highlights: Array<{
        icon: string;
        title: string;
        text: string;
    }>;
    publishedProducts: StorefrontProductCard[];
    totalPublishedCount: number;
}
export declare const getProductImageUrl: (p: any, index?: number) => string;
export declare const formatCurrencyINR: (amount?: number) => string;
export declare const seedStorefrontConfigIfEmpty: () => Promise<IStorefrontConfig>;
export declare const getStorefrontPreview: () => Promise<StorefrontPreviewResponse>;
export declare const getStorefrontHero: () => Promise<{
    id: string;
    title: string;
    type: string;
    summary: string;
    badgeText: string;
    ctaText: string;
    ctaLink: string;
    editLink: string;
    imageUrl: string;
}>;
export declare const getStorefrontProducts: (query?: any) => Promise<{
    items: StorefrontProductCard[];
    totalCount: number;
}>;
export declare const getStorefrontHighlights: () => Promise<import("../models/StorefrontConfig").IStorefrontHighlight[]>;
export declare const getStorefrontConfig: () => Promise<IStorefrontConfig>;
export declare const updateStorefrontConfig: (data: any, userId?: string) => Promise<IStorefrontConfig>;
export declare const toggleProductPublish: (productId: string, isPublished: boolean) => Promise<{
    productId: any;
    name: any;
    isPublished: any;
} | null>;
declare const _default: {
    getStorefrontPreview: typeof getStorefrontPreview;
    getStorefrontHero: typeof getStorefrontHero;
    getStorefrontProducts: typeof getStorefrontProducts;
    getStorefrontHighlights: typeof getStorefrontHighlights;
    getStorefrontConfig: typeof getStorefrontConfig;
    updateStorefrontConfig: typeof updateStorefrontConfig;
    toggleProductPublish: typeof toggleProductPublish;
    seedStorefrontConfigIfEmpty: typeof seedStorefrontConfigIfEmpty;
};
export default _default;
