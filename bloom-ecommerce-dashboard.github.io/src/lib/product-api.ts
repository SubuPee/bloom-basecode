import { fetchWithAuth, ApiError } from "./api";

export interface ProductImage {
  _id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface VariantAttribute {
  attribute: any;
  value: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  barcode?: string;
  attributes?: VariantAttribute[];
  purchasePrice?: number;
  sellingPrice: number;
  mrp?: number;
  images?: ProductImage[];
  status?: "active" | "inactive";
}

export interface ProductItem {
  _id: string;
  id?: string;
  productCode: string;
  productName: string;
  productType: "simple" | "variable" | "digital" | "service";
  category: any;
  subCategory?: any;
  brand?: any;
  unit: any;
  hsnSacCode?: string;
  barcode?: string;
  shortDescription?: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  tax?: any;
  reorderLevel?: number;
  stockQuantity?: number;
  stock?: number;
  images?: ProductImage[];
  hasVariants?: boolean;
  attributes?: any[];
  variants?: ProductVariant[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  requiresShipping?: boolean;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  status: "active" | "inactive" | "draft" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  publishedProducts: number;
  featuredProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  productType?: string;
  isPublished?: boolean | string;
  isFeatured?: boolean | string;
  hasVariants?: boolean | string;
  sort?: string;
}

export interface ProductOrder {
  id: string;
  customer: string;
  date: string;
  total: string;
  status: string;
  payment?: string;
}

export interface MasterOption {
  _id: string;
  id?: string;
  name: string;
  code?: string;
  status?: string;
}

export const productApi = {
  /**
   * Fetch paginated list of products with filters
   */
  async getProducts(params: ProductQueryParams = {}): Promise<{
    products: ProductItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search.trim());
    if (params.status && params.status !== "All") query.set("status", params.status.toLowerCase());
    if (params.category && params.category !== "All") query.set("category", params.category);
    if (params.subCategory && params.subCategory !== "All") query.set("subCategory", params.subCategory);
    if (params.brand && params.brand !== "All") query.set("brand", params.brand);
    if (params.productType && params.productType !== "All") query.set("productType", params.productType.toLowerCase());
    if (params.isPublished !== undefined && params.isPublished !== "All") {
      query.set("isPublished", String(params.isPublished));
    }
    if (params.isFeatured !== undefined && params.isFeatured !== "All") {
      query.set("isFeatured", String(params.isFeatured));
    }
    if (params.hasVariants !== undefined && params.hasVariants !== "All") {
      query.set("hasVariants", String(params.hasVariants));
    }
    if (params.sort) query.set("sort", params.sort);

    const queryString = query.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ""}`;
    const res = await fetchWithAuth<any>(url);

    return {
      products: res.data || [],
      pagination: res.pagination || {
        total: (res.data || []).length,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 1,
      },
    };
  },

  /**
   * Get product catalog metrics
   */
  async getProductStats(): Promise<ProductStats> {
    const res = await fetchWithAuth<ProductStats>("/api/products/stats");
    return (
      res.data || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        draftProducts: 0,
        publishedProducts: 0,
        featuredProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      }
    );
  },

  /**
   * Get product by ID, SKU, Slug or Index
   */
  async getProductById(idOrIdentifier: string): Promise<ProductItem> {
    const res = await fetchWithAuth<ProductItem>(`/api/products/${encodeURIComponent(idOrIdentifier)}`);
    if (!res.data) {
      throw new ApiError("Product not found", 404);
    }
    return res.data;
  },

  /**
   * Create a new product
   */
  async createProduct(payload: Partial<ProductItem>): Promise<ProductItem> {
    const res = await fetchWithAuth<ProductItem>("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, payload: Partial<ProductItem>): Promise<ProductItem> {
    const res = await fetchWithAuth<ProductItem>(`/api/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  /**
   * Update product status
   */
  async updateProductStatus(id: string, status: string): Promise<ProductItem> {
    const res = await fetchWithAuth<ProductItem>(`/api/products/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data!;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetchWithAuth<{ success: boolean; message: string }>(
      `/api/products/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
    return res.data || { success: true, message: res.message || "Product deleted successfully" };
  },

  /**
   * Duplicate a product
   */
  async duplicateProduct(id: string): Promise<ProductItem> {
    const res = await fetchWithAuth<ProductItem>(`/api/products/${encodeURIComponent(id)}/duplicate`, {
      method: "POST",
    });
    return res.data!;
  },

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(ids: string[], status: string): Promise<{ modifiedCount: number }> {
    const res = await fetchWithAuth<any>("/api/products/bulk/status", {
      method: "POST",
      body: JSON.stringify({ ids, status }),
    });
    return res.data || { modifiedCount: ids.length };
  },

  /**
   * Bulk update published state
   */
  async bulkUpdatePublish(ids: string[], isPublished: boolean): Promise<{ modifiedCount: number }> {
    const res = await fetchWithAuth<any>("/api/products/bulk/publish", {
      method: "POST",
      body: JSON.stringify({ ids, isPublished }),
    });
    return res.data || { modifiedCount: ids.length };
  },

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
    const res = await fetchWithAuth<any>("/api/products/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
    return res.data || { deletedCount: ids.length };
  },

  /**
   * Get orders containing this product
   */
  async getProductOrders(id: string): Promise<ProductOrder[]> {
    try {
      const res = await fetchWithAuth<ProductOrder[]>(`/api/products/${encodeURIComponent(id)}/orders`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch Master categories, brands, units, and tax classes for editor dropdowns
   */
  async getMasterOptions(): Promise<{
    categories: MasterOption[];
    brands: MasterOption[];
    units: MasterOption[];
    taxes: MasterOption[];
  }> {
    try {
      const [catsRes, brandsRes, unitsRes, taxesRes] = await Promise.allSettled([
        fetchWithAuth<any>("/api/admin/master/categories?limit=100"),
        fetchWithAuth<any>("/api/admin/master/brands?limit=100"),
        fetchWithAuth<any>("/api/admin/master/units?limit=100"),
        fetchWithAuth<any>("/api/admin/master/taxes?limit=100"),
      ]);

      const mapOptions = (res: PromiseSettledResult<any>, nameField: string) => {
        if (res.status === "fulfilled" && res.value?.data) {
          const list = Array.isArray(res.value.data) ? res.value.data : res.value.data.categories || res.value.data.items || [];
          return list.map((item: any) => ({
            _id: item._id || item.id,
            name: item[nameField] || item.name || item.title,
            code: item.code || item.categoryCode || item.brandCode,
            status: item.status,
          }));
        }
        return [];
      };

      return {
        categories: mapOptions(catsRes, "categoryName"),
        brands: mapOptions(brandsRes, "brandName"),
        units: mapOptions(unitsRes, "unitName"),
        taxes: mapOptions(taxesRes, "taxName"),
      };
    } catch {
      return { categories: [], brands: [], units: [], taxes: [] };
    }
  },
};
