import { fetchWithAuth, ApiError } from "./api";

export interface StorefrontProductCard {
  id: string;
  _id?: string;
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
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface StorefrontHero {
  id: string;
  title: string;
  type: string;
  summary: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
  editLink: string;
  imageUrl: string;
}

export interface StorefrontHighlight {
  icon: string;
  title: string;
  text: string;
}

export interface StorefrontStore {
  name: string;
  domain: string;
  liveUrl: string;
  description: string;
}

export interface StorefrontPreviewData {
  store: StorefrontStore;
  hero: StorefrontHero;
  highlights: StorefrontHighlight[];
  publishedProducts: StorefrontProductCard[];
  totalPublishedCount: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`Server returned an invalid response (${res.status})`, res.status);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || "An error occurred", res.status, json);
  }

  return json.data as T;
}

export const storefrontApi = {
  /**
   * Fetch complete storefront preview bundle (store info, hero, trust highlights, published catalog)
   */
  async getPreview(): Promise<StorefrontPreviewData> {
    const res = await fetchWithAuth("/api/storefront");
    return handleResponse<StorefrontPreviewData>(res);
  },

  /**
   * Fetch published products with optional search query or category filter
   */
  async getProducts(params?: {
    search?: string;
    category?: string;
  }): Promise<{ products: StorefrontProductCard[]; totalCount: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/storefront/products${qs ? `?${qs}` : ""}`);
    return handleResponse<{ products: StorefrontProductCard[]; totalCount: number }>(res);
  },

  /**
   * Fetch active hero banner
   */
  async getHero(): Promise<StorefrontHero> {
    const res = await fetchWithAuth("/api/storefront/hero");
    return handleResponse<StorefrontHero>(res);
  },

  /**
   * Fetch trust highlights
   */
  async getHighlights(): Promise<StorefrontHighlight[]> {
    const res = await fetchWithAuth("/api/storefront/highlights");
    return handleResponse<StorefrontHighlight[]>(res);
  },

  /**
   * Fetch storefront configuration
   */
  async getConfig(): Promise<any> {
    const res = await fetchWithAuth("/api/storefront/config");
    return handleResponse<any>(res);
  },

  /**
   * Update storefront configuration
   */
  async updateConfig(payload: any): Promise<any> {
    const res = await fetchWithAuth("/api/storefront/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Toggle product publication on storefront
   */
  async togglePublish(productId: string, isPublished: boolean): Promise<any> {
    const res = await fetchWithAuth(`/api/storefront/products/${productId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished }),
    });
    return handleResponse<any>(res);
  },
};
