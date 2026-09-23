import { fetchWithAuth, ApiError, API_BASE_URL } from "./api";

export interface OrderItemDetail {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  sku?: string;
  category?: string;
  image?: string;
}

export interface OrderTimelineStep {
  step: string;
  date?: string;
  time?: string;
  timestamp?: string;
  completed?: boolean;
  notes?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customer: string;
  email?: string;
  phone?: string;
  date: string;
  items: string;
  total: string;
  totalAmount?: number;
  payment: "Paid" | "Pending" | "Refunded" | "Failed";
  status: "Processing" | "Shipped" | "Delivered" | "Returned" | "Cancelled";
  products: string[];
  itemsList?: OrderItemDetail[];
  address?: string;
  customerSegment?: string;
  createdAt?: string;
  _id?: string;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone?: string;
  customerSegment?: string;
  shippingAddress: string;
  address?: string;
  items: string;
  subtotal: number;
  shippingFee: number;
  taxAmount?: number;
  totalAmount: number;
  total: string;
  payment: "Paid" | "Pending" | "Refunded" | "Failed";
  paymentMethod?: string;
  status: "Processing" | "Shipped" | "Delivered" | "Returned" | "Cancelled";
  timeline: OrderTimelineStep[];
  products: string[];
  itemsList: OrderItemDetail[];
  createdAt?: string;
  _id?: string;
}

export interface OrderStatCard {
  label: string;
  value: string;
  detail: string;
}

export interface OrderStats {
  cards: OrderStatCard[];
  totalOrders: number;
  totalRevenue: number;
  newOrdersCount?: number;
  processingCount?: number;
  inTransitCount?: number;
  returnsCount?: number;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface OrderInvoice {
  invoiceNumber: string;
  orderNumber: string;
  date: string;
  seller: {
    name: string;
    address: string;
    gstin?: string;
  };
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  totalFormatted: string;
  paymentStatus: string;
}

export const ordersApi = {
  /**
   * Fetch paginated list of orders
   */
  async getOrders(params: OrderQueryParams = {}): Promise<{
    orders: OrderListItem[];
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
    if (params.status && params.status !== "All") query.set("status", params.status);
    if (params.payment && params.payment !== "All payments" && params.payment !== "All") {
      query.set("payment", params.payment);
    }
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.sort) query.set("sort", params.sort);

    const queryString = query.toString();
    const url = `/api/orders${queryString ? `?${queryString}` : ""}`;
    const res = await fetchWithAuth<any>(url);

    return {
      orders: res.data || [],
      pagination: res.pagination || {
        total: (res.data || []).length,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 1,
      },
    };
  },

  /**
   * Get order metrics cards and revenue summaries
   */
  async getOrderStats(): Promise<OrderStats> {
    const res = await fetchWithAuth<any>("/api/orders/stats");
    return (
      res.data || {
        cards: [
          { label: "New orders", value: "128", detail: "12 since yesterday" },
          { label: "Processing", value: "34", detail: "8 need attention" },
          { label: "In transit", value: "67", detail: "92% on schedule" },
          { label: "Returns", value: "9", detail: "1.8% return rate" },
        ],
        totalOrders: 0,
        totalRevenue: 0,
      }
    );
  },

  /**
   * Get order detail by ID, orderNumber (with or without #), index, or ObjectId
   */
  async getOrderById(idOrNumber: string): Promise<OrderDetailData> {
    const cleanId = idOrNumber.startsWith("#") ? idOrNumber.slice(1) : idOrNumber;
    const res = await fetchWithAuth<OrderDetailData>(`/api/orders/${encodeURIComponent(cleanId)}`);
    if (!res.data) {
      throw new ApiError("Order not found", 404);
    }
    return res.data;
  },

  /**
   * Update order fulfillment status
   */
  async updateOrderStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<OrderDetailData> {
    const cleanId = id.startsWith("#") ? id.slice(1) : id;
    const res = await fetchWithAuth<OrderDetailData>(
      `/api/orders/${encodeURIComponent(cleanId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      }
    );
    return res.data!;
  },

  /**
   * Update order payment status
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    notes?: string
  ): Promise<OrderDetailData> {
    const cleanId = id.startsWith("#") ? id.slice(1) : id;
    const res = await fetchWithAuth<OrderDetailData>(
      `/api/orders/${encodeURIComponent(cleanId)}/payment`,
      {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus, notes }),
      }
    );
    return res.data!;
  },

  /**
   * Get invoice for order
   */
  async getOrderInvoice(id: string): Promise<OrderInvoice> {
    const cleanId = id.startsWith("#") ? id.slice(1) : id;
    const res = await fetchWithAuth<OrderInvoice>(
      `/api/orders/${encodeURIComponent(cleanId)}/invoice`
    );
    return res.data!;
  },

  /**
   * Export orders as CSV or JSON file
   */
  async exportOrders(format: "csv" | "json" = "csv"): Promise<void> {
    const token = localStorage.getItem("bloom_auth_token");
    const url = `${API_BASE_URL}/api/orders/export?format=${format}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error("Failed to export orders");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `orders-export-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Bulk update status for multiple orders
   */
  async bulkUpdateStatus(
    ids: string[],
    status: string,
    notes?: string
  ): Promise<{ modifiedCount: number }> {
    const cleanIds = ids.map((id) => (id.startsWith("#") ? id.slice(1) : id));
    const res = await fetchWithAuth<any>("/api/orders/bulk/status", {
      method: "POST",
      body: JSON.stringify({ ids: cleanIds, status, notes }),
    });
    return res.data || { modifiedCount: ids.length };
  },

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<void> {
    const cleanId = id.startsWith("#") ? id.slice(1) : id;
    await fetchWithAuth(`/api/orders/${encodeURIComponent(cleanId)}`, {
      method: "DELETE",
    });
  },
};
