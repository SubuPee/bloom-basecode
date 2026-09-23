import mongoose from "mongoose";
import StorefrontConfig, { IStorefrontConfig } from "../models/StorefrontConfig";
import Product from "../models/Product";
import cmsService from "./cms.service";
import logger from "../utils/logger";

// =====================================================
// INTERFACES & DTOs
// =====================================================

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

// Fallback high-res product images matching Bloom catalog aesthetic
const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  "wireless headphones":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "cotton t-shirt":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
  "organic cotton t-shirt":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
  "arc table lamp":
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
  "smart speaker":
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
  "vitamin c face serum":
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
  "minimalist sneakers":
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
};

const DEFAULT_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
];

export const getProductImageUrl = (p: any, index: number = 0): string => {
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary = p.images.find((img: any) => img.isPrimary) || p.images[0];
    if (primary && primary.url) return primary.url;
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

export const formatCurrencyINR = (amount: number = 0): string => {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

// =====================================================
// AUTO-SEED STOREFRONT CONFIG
// =====================================================

export const seedStorefrontConfigIfEmpty = async (): Promise<IStorefrontConfig> => {
  let config = await StorefrontConfig.findOne();
  if (config) {
    return config;
  }

  logger.info("Seeding initial Storefront configuration...");
  config = await StorefrontConfig.create({
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
      metaDescription:
        "A live preview of how your published catalog and content appear to shoppers.",
      ogImage:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
  });

  return config;
};

// =====================================================
// 1. GET STOREFRONT PREVIEW (COMPLETE BUNDLE FOR UI)
// =====================================================

export const getStorefrontPreview = async (): Promise<StorefrontPreviewResponse> => {
  const [config, heroCms, rawProducts] = await Promise.all([
    seedStorefrontConfigIfEmpty(),
    cmsService.getStorefrontHero(),
    Product.find({
      $or: [{ isPublished: true }, { status: "Active" }],
    })
      .populate("category", "name categoryName slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean(),
  ]);

  // Format published products
  const publishedProducts: StorefrontProductCard[] = rawProducts.map(
    (p: any, idx: number) => {
      const sellingPrice = Number(p.sellingPrice || 0);
      const mrp = Number(p.mrp || sellingPrice);
      const hasDiscount = mrp > sellingPrice;
      const discountPercentage = hasDiscount
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : 0;

      const categoryName =
        typeof p.category === "object" && p.category !== null
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
        sellingPriceFormatted: formatCurrencyINR(sellingPrice),
        mrp,
        mrpFormatted: formatCurrencyINR(mrp),
        hasDiscount,
        discountPercentage,
        image: getProductImageUrl(p, idx),
        rating: 4.8,
        reviewsCount: 12480,
        isPublished: p.isPublished !== false,
        isFeatured: Boolean(p.isFeatured),
        inStock: (p.stockQuantity ?? 10) > 0,
      };
    }
  );

  // Format hero section
  const heroTitle = heroCms?.title || "Monsoon Essentials";
  const heroType = heroCms?.type || "Homepage banner";
  const heroSummary =
    heroCms?.summary ||
    "Seasonal campaign featuring weather-ready apparel and accessories.";
  const heroCtaText = heroCms?.heroConfig?.ctaText || "Shop the edit";
  const heroCtaLink = heroCms?.heroConfig?.ctaLink || "/storefront";
  const heroId = heroCms?.id || config.heroSlug || "home-banner";

  const heroImage =
    publishedProducts[0]?.image ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  return {
    store: {
      name: config.storeName || "bloom.store",
      domain: config.storeDomain || "bloom.store",
      liveUrl: config.liveUrl || "https://bloom.store",
      description:
        "A live preview of how your published catalog and content appear to shoppers.",
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

// =====================================================
// 2. GET STOREFRONT HERO BANNER
// =====================================================

export const getStorefrontHero = async () => {
  const preview = await getStorefrontPreview();
  return preview.hero;
};

// =====================================================
// 3. GET PUBLISHED STOREFRONT PRODUCTS
// =====================================================

export const getStorefrontProducts = async (query: any = {}) => {
  const preview = await getStorefrontPreview();
  let items = preview.publishedProducts;

  if (query.search && query.search.trim()) {
    const s = query.search.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.productCode.toLowerCase().includes(s)
    );
  }

  if (query.category && query.category !== "All") {
    items = items.filter(
      (p) => p.category.toLowerCase() === query.category.toLowerCase()
    );
  }

  return {
    items,
    totalCount: items.length,
  };
};

// =====================================================
// 4. GET STOREFRONT HIGHLIGHTS
// =====================================================

export const getStorefrontHighlights = async () => {
  const config = await seedStorefrontConfigIfEmpty();
  return config.highlights;
};

// =====================================================
// 5. GET STOREFRONT CONFIG
// =====================================================

export const getStorefrontConfig = async () => {
  return seedStorefrontConfigIfEmpty();
};

// =====================================================
// 6. UPDATE STOREFRONT CONFIG
// =====================================================

export const updateStorefrontConfig = async (
  data: any,
  userId?: string
) => {
  const config = await seedStorefrontConfigIfEmpty();

  if (data.storeName !== undefined) config.storeName = data.storeName.trim();
  if (data.storeDomain !== undefined) config.storeDomain = data.storeDomain.trim();
  if (data.liveUrl !== undefined) config.liveUrl = data.liveUrl.trim();
  if (data.heroSlug !== undefined) config.heroSlug = data.heroSlug.trim();
  if (Array.isArray(data.highlights)) config.highlights = data.highlights;
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

  config.updatedBy = userId ? new mongoose.Types.ObjectId(userId) : null;
  await config.save();

  return config;
};

// =====================================================
// 7. TOGGLE PRODUCT PUBLISH STATUS
// =====================================================

export const toggleProductPublish = async (
  productId: string,
  isPublished: boolean
) => {
  const clean = productId.trim();
  let product: any = null;

  if (mongoose.Types.ObjectId.isValid(clean)) {
    product = await Product.findById(clean);
  }

  if (!product) {
    product = await Product.findOne({ productCode: clean });
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

export default {
  getStorefrontPreview,
  getStorefrontHero,
  getStorefrontProducts,
  getStorefrontHighlights,
  getStorefrontConfig,
  updateStorefrontConfig,
  toggleProductPublish,
  seedStorefrontConfigIfEmpty,
};
