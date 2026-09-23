"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProductPublish = exports.updateStorefrontConfig = exports.getStorefrontConfig = exports.getStorefrontHighlights = exports.getStorefrontProducts = exports.getStorefrontHero = exports.getStorefrontPreview = exports.seedStorefrontConfigIfEmpty = exports.formatCurrencyINR = exports.getProductImageUrl = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const StorefrontConfig_1 = __importDefault(require("../models/StorefrontConfig"));
const Product_1 = __importDefault(require("../models/Product"));
const cms_service_1 = __importDefault(require("./cms.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// Fallback high-res product images matching Bloom catalog aesthetic
const FALLBACK_PRODUCT_IMAGES = {
    "wireless headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "cotton t-shirt": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "organic cotton t-shirt": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "arc table lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    "smart speaker": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    "vitamin c face serum": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    "minimalist sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
};
const DEFAULT_FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
];
const getProductImageUrl = (p, index = 0) => {
    if (Array.isArray(p.images) && p.images.length > 0) {
        const primary = p.images.find((img) => img.isPrimary) || p.images[0];
        if (primary && primary.url)
            return primary.url;
    }
    const nameKey = (p.productName || p.name || "").toLowerCase().trim();
    for (const [key, url] of Object.entries(FALLBACK_PRODUCT_IMAGES)) {
        if (nameKey.includes(key)) {
            return url;
        }
    }
    const fallback = DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length];
    return fallback || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
};
exports.getProductImageUrl = getProductImageUrl;
const formatCurrencyINR = (amount = 0) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};
exports.formatCurrencyINR = formatCurrencyINR;
// =====================================================
// AUTO-SEED STOREFRONT CONFIG
// =====================================================
const seedStorefrontConfigIfEmpty = async () => {
    let config = await StorefrontConfig_1.default.findOne();
    if (config) {
        return config;
    }
    logger_1.default.info("Seeding initial Storefront configuration...");
    config = await StorefrontConfig_1.default.create({
        storeName: "bloom.store",
        storeDomain: "bloom.store",
        liveUrl: "https://bloom.store",
        heroSlug: "home-banner",
        highlights: [
            {
                icon: "Truck",
                title: "Free delivery",
                text: "On all orders above ₹999",
            },
            {
                icon: "Star",
                title: "4.8 average rating",
                text: "Across 12,480 reviews",
            },
            {
                icon: "ShoppingBag",
                title: "Easy returns",
                text: "30-day no-questions policy",
            },
        ],
        announcement: {
            enabled: true,
            text: "Free shipping across India on orders over ₹999",
            link: "/storefront",
        },
        seo: {
            metaTitle: "Bloom — Thoughtful Modern E-Commerce",
            metaDescription: "A live preview of how your published catalog and content appear to shoppers.",
            ogImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        },
    });
    return config;
};
exports.seedStorefrontConfigIfEmpty = seedStorefrontConfigIfEmpty;
// =====================================================
// 1. GET STOREFRONT PREVIEW (COMPLETE BUNDLE FOR UI)
// =====================================================
const getStorefrontPreview = async () => {
    const [config, heroCms, rawProducts] = await Promise.all([
        (0, exports.seedStorefrontConfigIfEmpty)(),
        cms_service_1.default.getStorefrontHero(),
        Product_1.default.find({
            $or: [{ isPublished: true }, { status: "Active" }],
        })
            .populate("category", "name categoryName slug")
            .sort({ isFeatured: -1, createdAt: -1 })
            .lean(),
    ]);
    // Format published products
    const publishedProducts = rawProducts.map((p, idx) => {
        const sellingPrice = Number(p.sellingPrice || 0);
        const mrp = Number(p.mrp || sellingPrice);
        const hasDiscount = mrp > sellingPrice;
        const discountPercentage = hasDiscount
            ? Math.round(((mrp - sellingPrice) / mrp) * 100)
            : 0;
        const categoryName = typeof p.category === "object" && p.category !== null
            ? p.category.name || p.category.categoryName || "Lifestyle"
            : typeof p.category === "string" && p.category
                ? p.category
                : "Lifestyle";
        return {
            id: p.productCode || String(p._id),
            _id: String(p._id),
            productCode: p.productCode || `PROD-${idx + 1}`,
            name: p.productName || "Bloom Catalog Item",
            category: categoryName,
            sellingPrice,
            sellingPriceFormatted: (0, exports.formatCurrencyINR)(sellingPrice),
            mrp,
            mrpFormatted: (0, exports.formatCurrencyINR)(mrp),
            hasDiscount,
            discountPercentage,
            image: (0, exports.getProductImageUrl)(p, idx),
            rating: 4.8,
            reviewsCount: 12480,
            isPublished: p.isPublished !== false,
            isFeatured: Boolean(p.isFeatured),
            inStock: (p.stockQuantity ?? 10) > 0,
        };
    });
    // Format hero section
    const heroTitle = heroCms?.title || "Monsoon Essentials";
    const heroType = heroCms?.type || "Homepage banner";
    const heroSummary = heroCms?.summary ||
        "Seasonal campaign featuring weather-ready apparel and accessories.";
    const heroCtaText = heroCms?.heroConfig?.ctaText || "Shop the edit";
    const heroCtaLink = heroCms?.heroConfig?.ctaLink || "/storefront";
    const heroId = heroCms?.id || config.heroSlug || "home-banner";
    const heroImage = publishedProducts[0]?.image ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    return {
        store: {
            name: config.storeName || "bloom.store",
            domain: config.storeDomain || "bloom.store",
            liveUrl: config.liveUrl || "https://bloom.store",
            description: "A live preview of how your published catalog and content appear to shoppers.",
        },
        hero: {
            id: heroId,
            title: heroTitle,
            type: heroType,
            summary: heroSummary,
            badgeText: heroType,
            ctaText: heroCtaText,
            ctaLink: heroCtaLink,
            editLink: `/cms/${heroId}`,
            imageUrl: heroImage,
        },
        highlights: config.highlights || [
            { icon: "Truck", title: "Free delivery", text: "On all orders above ₹999" },
            { icon: "Star", title: "4.8 average rating", text: "Across 12,480 reviews" },
            { icon: "ShoppingBag", title: "Easy returns", text: "30-day no-questions policy" },
        ],
        publishedProducts,
        totalPublishedCount: publishedProducts.length,
    };
};
exports.getStorefrontPreview = getStorefrontPreview;
// =====================================================
// 2. GET STOREFRONT HERO BANNER
// =====================================================
const getStorefrontHero = async () => {
    const preview = await (0, exports.getStorefrontPreview)();
    return preview.hero;
};
exports.getStorefrontHero = getStorefrontHero;
// =====================================================
// 3. GET PUBLISHED STOREFRONT PRODUCTS
// =====================================================
const getStorefrontProducts = async (query = {}) => {
    const preview = await (0, exports.getStorefrontPreview)();
    let items = preview.publishedProducts;
    if (query.search && query.search.trim()) {
        const s = query.search.toLowerCase().trim();
        items = items.filter((p) => p.name.toLowerCase().includes(s) ||
            p.category.toLowerCase().includes(s) ||
            p.productCode.toLowerCase().includes(s));
    }
    if (query.category && query.category !== "All") {
        items = items.filter((p) => p.category.toLowerCase() === query.category.toLowerCase());
    }
    return {
        items,
        totalCount: items.length,
    };
};
exports.getStorefrontProducts = getStorefrontProducts;
// =====================================================
// 4. GET STOREFRONT HIGHLIGHTS
// =====================================================
const getStorefrontHighlights = async () => {
    const config = await (0, exports.seedStorefrontConfigIfEmpty)();
    return config.highlights;
};
exports.getStorefrontHighlights = getStorefrontHighlights;
// =====================================================
// 5. GET STOREFRONT CONFIG
// =====================================================
const getStorefrontConfig = async () => {
    return (0, exports.seedStorefrontConfigIfEmpty)();
};
exports.getStorefrontConfig = getStorefrontConfig;
// =====================================================
// 6. UPDATE STOREFRONT CONFIG
// =====================================================
const updateStorefrontConfig = async (data, userId) => {
    const config = await (0, exports.seedStorefrontConfigIfEmpty)();
    if (data.storeName !== undefined)
        config.storeName = data.storeName.trim();
    if (data.storeDomain !== undefined)
        config.storeDomain = data.storeDomain.trim();
    if (data.liveUrl !== undefined)
        config.liveUrl = data.liveUrl.trim();
    if (data.heroSlug !== undefined)
        config.heroSlug = data.heroSlug.trim();
    if (Array.isArray(data.highlights))
        config.highlights = data.highlights;
    if (data.announcement) {
        config.announcement = {
            enabled: data.announcement.enabled ?? config.announcement?.enabled ?? false,
            text: data.announcement.text || config.announcement?.text || "",
            link: data.announcement.link || config.announcement?.link || "",
        };
    }
    if (data.seo) {
        config.seo = {
            metaTitle: data.seo.metaTitle || config.seo?.metaTitle || "",
            metaDescription: data.seo.metaDescription || config.seo?.metaDescription || "",
            ogImage: data.seo.ogImage || config.seo?.ogImage || "",
        };
    }
    config.updatedBy = userId ? new mongoose_1.default.Types.ObjectId(userId) : null;
    await config.save();
    return config;
};
exports.updateStorefrontConfig = updateStorefrontConfig;
// =====================================================
// 7. TOGGLE PRODUCT PUBLISH STATUS
// =====================================================
const toggleProductPublish = async (productId, isPublished) => {
    const clean = productId.trim();
    let product = null;
    if (mongoose_1.default.Types.ObjectId.isValid(clean)) {
        product = await Product_1.default.findById(clean);
    }
    if (!product) {
        product = await Product_1.default.findOne({ productCode: clean });
    }
    if (!product) {
        return null;
    }
    product.isPublished = isPublished;
    await product.save();
    return {
        productId: product.productCode || String(product._id),
        name: product.productName,
        isPublished: product.isPublished,
    };
};
exports.toggleProductPublish = toggleProductPublish;
exports.default = {
    getStorefrontPreview: exports.getStorefrontPreview,
    getStorefrontHero: exports.getStorefrontHero,
    getStorefrontProducts: exports.getStorefrontProducts,
    getStorefrontHighlights: exports.getStorefrontHighlights,
    getStorefrontConfig: exports.getStorefrontConfig,
    updateStorefrontConfig: exports.updateStorefrontConfig,
    toggleProductPublish: exports.toggleProductPublish,
    seedStorefrontConfigIfEmpty: exports.seedStorefrontConfigIfEmpty,
};
//# sourceMappingURL=storefront.service.js.map