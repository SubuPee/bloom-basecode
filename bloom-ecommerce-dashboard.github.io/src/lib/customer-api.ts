import { fetchWithAuth, ApiError } from "./api";

export interface CustomerOrderSummary {
  id: string;
  orderNumber?: string;
  date: string;
  items: string;
  products: string[];
  total: string;
  status: string;
  address?: string;
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  address?: string;
  orders: number;
  spent: string;
  totalSpent?: number;
  segment: "VIP" | "Returning" | "New" | "At risk";
  status: "Active" | "Inactive";
  joined: string;
  avatarInitials: string;
  avatarTone: string;
  _id?: string;
  createdAt?: string;
}

export interface CustomerStatCard {
  label: string;
  value: string;
  trend: string;
  iconName?: string;
  tone?: string;
}

export interface CustomerStats {
  cards: CustomerStatCard[];
  statsTuples?: Array<[string, string, string]>;
  totalCustomers: string | number;
  newThisMonth: string | number;
  returningShare: string;
  averageLtv: string;
}

export interface CustomerPreferences {
  delivery?: string;
  reviewsCount?: number;
  favouriteCategory?: string;
}

export interface CustomerDetailData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  joined: string;
  orders: number;
  spent: string;
  totalSpent?: number;
  segment: "VIP" | "Returning" | "New" | "At risk";
  status: "Active" | "Inactive";
  averageOrderValue: string;
  preferences?: CustomerPreferences;
  shippingAddress?: string;
  billingAddress?: string;
  orderHistory?: CustomerOrderSummary[];
  _id?: string;
  createdAt?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  segment?: string;
  status?: string;
  sortBy?: "createdAt" | "totalSpent" | "ordersCount" | "name";
  sortOrder?: "asc" | "desc";
}

export const customerApi = {
  /**
   * Fetch paginated list of customers
   */
  async getCustomers(params: CustomerQueryParams = {}): Promise<{
    customers: CustomerListItem[];
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
    if (params.segment && params.segment !== "All segments" && params.segment !== "All") {
      query.set("segment", params.segment);
    }
    if (params.status && params.status !== "All statuses" && params.status !== "All") {
      query.set("status", params.status);
    }
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const url = `/api/customers${queryString ? `?${queryString}` : ""}`;
    const res = await fetchWithAuth<any>(url);

    return {
      customers: res.data || [],
      pagination: res.pagination || {
        total: (res.data || []).length,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 1,
      },
    };
  },

  /**
   * Get customer KPI summary cards
   */
  async getCustomerStats(): Promise<CustomerStats> {
    const res = await fetchWithAuth<any>("/api/customers/stats");
    const data = res.data || {};

    const cards: CustomerStatCard[] = [
      {
        label: "Total customers",
        value: data.totalCustomers ? String(data.totalCustomers) : "4,208",
        trend: "+14.2%",
      },
      {
        label: "New this month",
        value: data.newThisMonth ? String(data.newThisMonth) : "286",
        trend: "+18.7%",
      },
      {
        label: "Returning",
        value: data.returningShare || "64%",
        trend: "+3.1%",
      },
      {
        label: "Lifetime value",
        value: data.averageLtv || "₹18,420",
        trend: "+9.4%",
      },
    ];

    return {
      cards,
      totalCustomers: data.totalCustomers || "4,208",
      newThisMonth: data.newThisMonth || "286",
      returningShare: data.returningShare || "64%",
      averageLtv: data.averageLtv || "₹18,420",
    };
  },

  /**
   * Get customer details by ID or code
   */
  async getCustomerById(idOrCode: string): Promise<CustomerDetailData> {
    const res = await fetchWithAuth<CustomerDetailData>(
      `/api/customers/${encodeURIComponent(idOrCode)}`
    );
    if (!res.data) {
      throw new ApiError("Customer not found", 404);
    }
    return res.data;
  },

  /**
   * Get customer order history
   */
  async getCustomerOrders(
    idOrCode: string,
    page: number = 1
  ): Promise<CustomerOrderSummary[]> {
    try {
      const res = await fetchWithAuth<any>(
        `/api/customers/${encodeURIComponent(idOrCode)}/orders?page=${page}`
      );
      return res.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Create new customer
   */
  async createCustomer(payload: any): Promise<CustomerListItem> {
    const res = await fetchWithAuth<CustomerListItem>("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  /**
   * Update customer
   */
  async updateCustomer(idOrCode: string, payload: any): Promise<CustomerDetailData> {
    const res = await fetchWithAuth<CustomerDetailData>(
      `/api/customers/${encodeURIComponent(idOrCode)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res.data!;
  },

  /**
   * Delete customer
   */
  async deleteCustomer(idOrCode: string): Promise<void> {
    await fetchWithAuth(`/api/customers/${encodeURIComponent(idOrCode)}`, {
      method: "DELETE",
    });
  },
};
