import { fetchWithAuth, ApiError } from "./api";

export interface InventoryOverviewData {
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;
  damagedStock: number;
  expiredStock: number;
  totalStockValue?: number;
  categoryStockData: Array<{ name: string; value: number }>;
  recentMovements: StockMovementItem[];
}

export interface StockVariantItem {
  id?: string;
  _id: string;
  productId: any;
  variantId: string;
  warehouseId: any;
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;
  damagedStock: number;
  expiredStock: number;
  totalStock: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  productName?: string;
  sku?: string;
  category?: string;
  warehouseName?: string;
  lastUpdated?: string;
}

export interface LowStockItem {
  _id: string;
  productId: any;
  variantId: string;
  warehouseId: any;
  availableStock: number;
  minStock: number;
  reorderQuantity?: number;
  vendorId?: any;
}

export interface OutOfStockItem {
  _id: string;
  productId: any;
  variantId: string;
  warehouseId: any;
  availableStock: number;
  reservedStock: number;
  backorderCount?: number;
  vendorId?: any;
}

export interface StockMovementItem {
  _id: string;
  movementId: string;
  productId: any;
  variantId: string;
  warehouseId: any;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  batchNumber?: string;
  performedBy?: any;
  notes?: string;
  createdAt: string;
}

export interface StockTransferItem {
  _id: string;
  transferId: string;
  productId: any;
  variantId: string;
  fromWarehouseId: any;
  toWarehouseId: any;
  quantity: number;
  status: "Pending" | "In Transit" | "Completed" | "Cancelled";
  batchNumber?: string;
  notes?: string;
  initiatedBy?: any;
  receivedBy?: any;
  receivedAt?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface AddStockPayload {
  productId: string;
  variantId: string;
  warehouseId: string;
  vendorId?: string;
  sku?: string;
  unitCode?: string;
  quantity: number;
  batchNumber?: string;
  purchasePrice?: number;
  notes: string;
  referenceId?: string;
  location?: string;
}

export interface AdjustStockPayload {
  productId: string;
  variantId: string;
  warehouseId: string;
  adjustmentType: "Increase" | "Decrease" | "Damage" | "Expiry";
  quantity: number;
  reason: string;
  notes: string;
  batchNumber?: string;
}

export interface InitiateTransferPayload {
  productId: string;
  variantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  batchNumber?: string;
  notes?: string;
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

  return (json.data !== undefined ? json.data : json) as T;
}

export const inventoryApi = {
  /**
   * Get aggregate inventory overview counters, category breakdown, and recent movements
   */
  async getOverview(): Promise<InventoryOverviewData> {
    const res = await fetchWithAuth("/api/inventory/overview");
    return handleResponse<InventoryOverviewData>(res);
  },

  /**
   * Get paginated variant stock ledger
   */
  async getStock(params?: {
    search?: string;
    vendorId?: string;
    warehouseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: StockVariantItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.vendorId && params.vendorId !== "All") searchParams.set("vendorId", params.vendorId);
    if (params?.warehouseId && params.warehouseId !== "All") searchParams.set("warehouseId", params.warehouseId);
    if (params?.status && params.status !== "All") searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/stock${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: StockVariantItem[]; pagination?: { total: number } } | StockVariantItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Add inbound stock (Goods Receipt)
   */
  async addStock(payload: AddStockPayload): Promise<any> {
    const res = await fetchWithAuth("/api/inventory/stock/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Apply stock adjustment (Increase, Decrease, Damage, Expiry)
   */
  async adjustStock(payload: AdjustStockPayload): Promise<any> {
    const res = await fetchWithAuth("/api/inventory/stock/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  /**
   * Get adjustment history entries
   */
  async getAdjustmentHistory(params?: { page?: number; limit?: number }): Promise<{ items: StockMovementItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/stock/adjust${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: StockMovementItem[]; pagination?: { total: number } } | StockMovementItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Get low stock alerts
   */
  async getLowStock(params?: {
    search?: string;
    vendorId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: LowStockItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.vendorId && params.vendorId !== "All") searchParams.set("vendorId", params.vendorId);
    if (params?.warehouseId && params.warehouseId !== "All") searchParams.set("warehouseId", params.warehouseId);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/low-stock${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: LowStockItem[]; pagination?: { total: number } } | LowStockItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Get out of stock items and shortage metrics
   */
  async getOutOfStock(params?: {
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: OutOfStockItem[]; total: number; stats: { totalOutOfStockSkus: number; backorderUnits: number; vendorsImpacted: number } }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.vendorId && params.vendorId !== "All") searchParams.set("vendorId", params.vendorId);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/out-of-stock${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{
      stats?: { totalOutOfStockSkus: number; backorderUnits: number; vendorsImpacted: number };
      data: OutOfStockItem[];
      pagination?: { total: number };
    }>(res);

    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
      stats: data.stats || { totalOutOfStockSkus: 0, backorderUnits: 0, vendorsImpacted: 0 },
    };
  },

  /**
   * Get chronological stock movements ledger
   */
  async getMovements(params?: {
    search?: string;
    movementType?: string;
    vendorId?: string;
    warehouseId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: StockMovementItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.movementType && params.movementType !== "All") searchParams.set("movementType", params.movementType);
    if (params?.vendorId && params.vendorId !== "All") searchParams.set("vendorId", params.vendorId);
    if (params?.warehouseId && params.warehouseId !== "All") searchParams.set("warehouseId", params.warehouseId);
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/movements${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: StockMovementItem[]; pagination?: { total: number } } | StockMovementItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Get stock audit history
   */
  async getAuditHistory(params?: {
    search?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: StockMovementItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.movementType && params.movementType !== "All") searchParams.set("movementType", params.movementType);
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/history${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: StockMovementItem[]; pagination?: { total: number } } | StockMovementItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Get inter-warehouse stock transfers
   */
  async getTransfers(params?: {
    status?: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: StockTransferItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== "All") searchParams.set("status", params.status);
    if (params?.fromWarehouseId && params.fromWarehouseId !== "All") searchParams.set("fromWarehouseId", params.fromWarehouseId);
    if (params?.toWarehouseId && params.toWarehouseId !== "All") searchParams.set("toWarehouseId", params.toWarehouseId);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/inventory/transfers${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ data: StockTransferItem[]; pagination?: { total: number } } | StockTransferItem[]>(res);

    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    return {
      items: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  /**
   * Initiate inter-warehouse stock transfer
   */
  async initiateTransfer(payload: InitiateTransferPayload): Promise<StockTransferItem> {
    const res = await fetchWithAuth("/api/inventory/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<StockTransferItem>(res);
  },

  /**
   * Receive / confirm transfer at destination warehouse
   */
  async receiveTransfer(id: string): Promise<any> {
    const res = await fetchWithAuth(`/api/inventory/transfers/${encodeURIComponent(id)}/receive`, {
      method: "PATCH",
    });
    return handleResponse<any>(res);
  },

  /**
   * Cancel an in-transit transfer and reverse stock to source
   */
  async cancelTransfer(id: string, cancelReason: string): Promise<any> {
    const res = await fetchWithAuth(`/api/inventory/transfers/${encodeURIComponent(id)}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelReason }),
    });
    return handleResponse<any>(res);
  },
};
