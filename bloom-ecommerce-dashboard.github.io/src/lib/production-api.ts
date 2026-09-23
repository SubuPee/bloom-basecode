import { fetchWithAuth, ApiError } from "./api";
import type { RawMaterialItem } from "./bloom-vendor-store";

export interface ProductionOrder {
  id: string;
  orderId?: string;
  _id?: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  unit: string;
  batchNumber: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  goodQuantity: number;
  remainingQuantity: number;
  rawMaterials: RawMaterialItem[];
  productionDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  warehouseId: string;
  warehouseName: string;
  storageLocation: string;
  status: "Planned" | "In Progress" | "Partially Completed" | "Completed" | "Cancelled";
  notes?: string;
  cancelReason?: string;
  createdBy: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
}

export interface ProductionBatchItem {
  id: string;
  _id?: string;
  batchNumber: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  vendorId: string;
  vendorName: string;
  productionId?: string;
  productionOrderId?: any;
  initialQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  expiredQuantity: number;
  manufacturingDate: string;
  expiryDate?: string;
  warehouseId: string;
  warehouseName: string;
  location: string;
  status: "Active" | "Blocked" | "Expired" | "Quarantined" | "Consumed";
  createdAt?: string;
}

export interface ProductionOverviewData {
  totalOrders: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  totalProduced: number;
  totalGood: number;
  totalRejected: number;
  yieldPercentage: number;
  activeOrders: ProductionOrder[];
  recentBatches: ProductionBatchItem[];
}

export interface ProductionQueryParams {
  search?: string;
  status?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ProductionListResponse {
  data: ProductionOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats?: {
    totalOrders: number;
    planned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export interface ProductionBatchesResponse {
  data: ProductionBatchItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats?: {
    activeBatches: number;
    expiredBatches: number;
    quarantinedBatches: number;
    totalAvailable: number;
  };
}

export interface ProductionHistoryResponse {
  data: ProductionOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats?: {
    totalCompleted: number;
    totalCancelled: number;
    totalProduced: number;
    totalGood: number;
    totalRejected: number;
    overallYieldRate: number;
  };
}

export interface CreateProductionPayload {
  productId: string;
  variantId: string;
  vendorId: string;
  batchNumber: string;
  plannedQuantity: number;
  unit: string;
  warehouseId: string;
  storageLocation?: string;
  expectedCompletion: string;
  notes?: string;
  rawMaterials?: Array<{
    name: string;
    requiredQuantity: number;
    unit: string;
  }>;
}

export function mapOrderFromBackend(raw: any): ProductionOrder {
  const prodObj = typeof raw.productId === "object" && raw.productId !== null ? raw.productId : null;
  const vendObj = typeof raw.vendorId === "object" && raw.vendorId !== null ? raw.vendorId : null;
  const whObj = typeof raw.warehouseId === "object" && raw.warehouseId !== null ? raw.warehouseId : null;
  const userObj = typeof raw.createdBy === "object" && raw.createdBy !== null ? raw.createdBy : null;

  const id = raw.orderId || raw._id || raw.id || "PRD-UNKNOWN";
  const plannedQty = Number(raw.plannedQuantity) || 0;
  const producedQty = Number(raw.producedQuantity) || 0;
  const goodQty = Number(raw.goodQuantity) || 0;
  const rejectedQty = Number(raw.rejectedQuantity) || 0;
  const remainingQty = Math.max(0, plannedQty - (producedQty || goodQty));

  return {
    id,
    orderId: raw.orderId || id,
    _id: raw._id,
    vendorId: vendObj?._id || raw.vendorId || "",
    vendorName: vendObj?.businessName || raw.vendorName || "Bloom Partner",
    productId: prodObj?._id || raw.productId || "",
    productName: prodObj?.name || raw.productName || "Botanical Formulation",
    variantId: raw.variantId || "Default",
    variantName: raw.variantName || raw.variantId || "Standard 100ml",
    unit: raw.unit || "PCS",
    batchNumber: raw.batchNumber || "BAT-PENDING",
    plannedQuantity: plannedQty,
    producedQuantity: producedQty,
    rejectedQuantity: rejectedQty,
    goodQuantity: goodQty,
    remainingQuantity: remainingQty,
    rawMaterials: Array.isArray(raw.rawMaterials) ? raw.rawMaterials : [],
    productionDate: raw.createdAt
      ? new Date(raw.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expectedCompletion: raw.expectedCompletion
      ? new Date(raw.expectedCompletion).toISOString().slice(0, 10)
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    actualCompletion: raw.completedAt
      ? new Date(raw.completedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined,
    warehouseId: whObj?._id || raw.warehouseId || "",
    warehouseName: whObj?.name || raw.warehouseName || "Central Fulfillment Hub",
    storageLocation: raw.storageLocation || raw.location || "A-01-S1-B01",
    status: raw.status || "Planned",
    notes: raw.notes || "",
    cancelReason: raw.cancelReason,
    createdBy: userObj?.name || raw.createdBy || "Operations Manager",
    startedAt: raw.startedAt,
    completedAt: raw.completedAt,
    cancelledAt: raw.cancelledAt,
    createdAt: raw.createdAt,
  };
}

export function mapBatchFromBackend(raw: any): ProductionBatchItem {
  const prodObj = typeof raw.productId === "object" && raw.productId !== null ? raw.productId : null;
  const vendObj = typeof raw.vendorId === "object" && raw.vendorId !== null ? raw.vendorId : null;
  const whObj = typeof raw.warehouseId === "object" && raw.warehouseId !== null ? raw.warehouseId : null;
  const prdOrderObj = typeof raw.productionOrderId === "object" && raw.productionOrderId !== null ? raw.productionOrderId : null;

  const id = raw._id || raw.id || raw.batchNumber || `BAT-${Date.now()}`;
  const totalQty = Number(raw.totalQuantity || raw.initialQuantity || 0);
  const availQty = Number(raw.availableQuantity ?? totalQty);
  const damagedQty = Number(raw.damagedQuantity || 0);
  const expiredQty = Number(raw.expiredQuantity || 0);

  let status: ProductionBatchItem["status"] = "Active";
  if (raw.status === "Quarantined" || raw.status === "Blocked") {
    status = "Blocked";
  } else if (raw.status === "Expired") {
    status = "Expired";
  } else if (raw.status === "Consumed") {
    status = "Consumed";
  } else {
    status = "Active";
  }

  return {
    id,
    _id: raw._id,
    batchNumber: raw.batchNumber || "BAT-UNKNOWN",
    productId: prodObj?._id || raw.productId || "",
    productName: prodObj?.name || raw.productName || "Botanical Formulation",
    variantId: raw.variantId || "Default",
    variantName: raw.variantName || raw.variantId || "Standard",
    vendorId: vendObj?._id || raw.vendorId || "",
    vendorName: vendObj?.businessName || raw.vendorName || "Bloom Partner",
    productionId: prdOrderObj?.orderId || raw.productionId || "",
    productionOrderId: raw.productionOrderId,
    initialQuantity: totalQty,
    availableQuantity: availQty,
    damagedQuantity: damagedQty,
    expiredQuantity: expiredQty,
    manufacturingDate: raw.manufacturingDate
      ? new Date(raw.manufacturingDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    expiryDate: raw.expiryDate
      ? new Date(raw.expiryDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined,
    warehouseId: whObj?._id || raw.warehouseId || "",
    warehouseName: whObj?.name || raw.warehouseName || "Central Fulfillment Hub",
    location: raw.location || raw.storageLocation || "Warehouse Storage",
    status,
    createdAt: raw.createdAt,
  };
}

export const productionApi = {
  /**
   * 1. GET /api/production/overview
   */
  async getOverview(): Promise<ProductionOverviewData> {
    const res = await fetchWithAuth<any>("/production/overview");
    const rawData = res.data || res;
    return {
      totalOrders: Number(rawData.totalOrders || 0),
      activeOrdersCount: Number(rawData.activeOrdersCount || 0),
      completedOrdersCount: Number(rawData.completedOrdersCount || 0),
      cancelledOrdersCount: Number(rawData.cancelledOrdersCount || 0),
      totalProduced: Number(rawData.totalProduced || 0),
      totalGood: Number(rawData.totalGood || 0),
      totalRejected: Number(rawData.totalRejected || 0),
      yieldPercentage: Number(rawData.yieldPercentage ?? 98),
      activeOrders: Array.isArray(rawData.activeOrders) ? rawData.activeOrders.map(mapOrderFromBackend) : [],
      recentBatches: Array.isArray(rawData.recentBatches) ? rawData.recentBatches.map(mapBatchFromBackend) : [],
    };
  },

  /**
   * 2. GET /api/production/orders
   */
  async getOrders(params?: ProductionQueryParams): Promise<ProductionListResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.status && params.status !== "All") sp.set("status", params.status);
    if (params?.vendorId && params.vendorId !== "All") sp.set("vendorId", params.vendorId);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));

    const qs = sp.toString();
    const endpoint = `/production/orders${qs ? `?${qs}` : ""}`;
    const res = await fetchWithAuth<any>(endpoint);
    const rawData = res.data || res;

    return {
      data: Array.isArray(rawData.data) ? rawData.data.map(mapOrderFromBackend) : [],
      pagination: rawData.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
      stats: rawData.stats,
    };
  },

  /**
   * 3. GET /api/production/orders/:id
   */
  async getOrderById(idOrCode: string): Promise<{ order: ProductionOrder; relatedBatch: ProductionBatchItem | null }> {
    const res = await fetchWithAuth<any>(`/production/orders/${encodeURIComponent(idOrCode)}`);
    const rawData = res.data || res;
    const rawOrder = rawData.order || rawData;
    const rawBatch = rawData.relatedBatch;

    return {
      order: mapOrderFromBackend(rawOrder),
      relatedBatch: rawBatch ? mapBatchFromBackend(rawBatch) : null,
    };
  },

  /**
   * 4. POST /api/production/orders
   */
  async createOrder(payload: CreateProductionPayload): Promise<ProductionOrder> {
    const res = await fetchWithAuth<any>("/production/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const raw = res.data || res;
    return mapOrderFromBackend(raw);
  },

  /**
   * 5. PATCH /api/production/orders/:id/start
   */
  async startOrder(idOrCode: string): Promise<ProductionOrder> {
    const res = await fetchWithAuth<any>(`/production/orders/${encodeURIComponent(idOrCode)}/start`, {
      method: "PATCH",
    });
    const raw = res.data || res;
    return mapOrderFromBackend(raw);
  },

  /**
   * 6. PATCH /api/production/orders/:id/complete
   */
  async completeOrder(
    idOrCode: string,
    producedQuantity: number,
    rejectedQuantity: number
  ): Promise<{ order: ProductionOrder; batch?: ProductionBatchItem }> {
    const res = await fetchWithAuth<any>(`/production/orders/${encodeURIComponent(idOrCode)}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ producedQuantity, rejectedQuantity }),
    });
    const raw = res.data || res;
    return {
      order: mapOrderFromBackend(raw.order || raw),
      batch: raw.batch ? mapBatchFromBackend(raw.batch) : undefined,
    };
  },

  /**
   * 7. PATCH /api/production/orders/:id/cancel
   */
  async cancelOrder(idOrCode: string, cancelReason: string): Promise<ProductionOrder> {
    const res = await fetchWithAuth<any>(`/production/orders/${encodeURIComponent(idOrCode)}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ cancelReason }),
    });
    const raw = res.data || res;
    return mapOrderFromBackend(raw);
  },

  /**
   * 8. GET /api/production/batches
   */
  async getBatches(params?: ProductionQueryParams): Promise<ProductionBatchesResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.status && params.status !== "All") {
      const s = params.status === "Blocked" ? "Quarantined" : params.status;
      sp.set("status", s);
    }
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));

    const qs = sp.toString();
    const endpoint = `/production/batches${qs ? `?${qs}` : ""}`;
    const res = await fetchWithAuth<any>(endpoint);
    const rawData = res.data || res;

    return {
      data: Array.isArray(rawData.data) ? rawData.data.map(mapBatchFromBackend) : [],
      pagination: rawData.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
      stats: rawData.stats,
    };
  },

  /**
   * 9. PATCH /api/production/batches/:id/status
   */
  async updateBatchStatus(idOrBatchNumber: string, status: "Active" | "Quarantined" | "Expired" | "Consumed"): Promise<ProductionBatchItem> {
    const res = await fetchWithAuth<any>(`/production/batches/${encodeURIComponent(idOrBatchNumber)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const raw = res.data || res;
    return mapBatchFromBackend(raw);
  },

  /**
   * 10. GET /api/production/history
   */
  async getHistory(params?: ProductionQueryParams): Promise<ProductionHistoryResponse> {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.vendorId && params.vendorId !== "All") sp.set("vendorId", params.vendorId);
    if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
    if (params?.dateTo) sp.set("dateTo", params.dateTo);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));

    const qs = sp.toString();
    const endpoint = `/production/history${qs ? `?${qs}` : ""}`;
    const res = await fetchWithAuth<any>(endpoint);
    const rawData = res.data || res;

    return {
      data: Array.isArray(rawData.data) ? rawData.data.map(mapOrderFromBackend) : [],
      pagination: rawData.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
      stats: rawData.stats,
    };
  },
};
