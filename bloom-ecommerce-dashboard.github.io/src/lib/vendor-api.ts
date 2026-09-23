import { fetchWithAuth, ApiError } from "./api";
import type {
  Vendor,
  VendorOrder,
  VendorSettlement,
  VendorPayment,
  VendorReturn,
  VendorTransaction,
  VendorActivityLog,
  VendorDocument,
  VendorBankInfo,
  VendorTaxInfo,
} from "./bloom-vendor-store";

export interface VendorDashboardStats {
  totalVendors: number;
  activeVendors: number;
  pendingReview: number;
  totalGMV: number;
  totalCommission: number;
  pendingPayouts: number;
}

export interface RegisterVendorPayload {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  businessType?: "Manufacturer" | "Wholesaler" | "D2C Brand" | "Distributor";
  commissionRate?: number;
  taxInfo?: Partial<VendorTaxInfo>;
  bankInfo?: Partial<VendorBankInfo>;
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

export const vendorApi = {
  /**
   * Get high-level vendor metrics & KPI summary cards
   */
  async getDashboardStats(): Promise<VendorDashboardStats> {
    const res = await fetchWithAuth("/api/vendors/dashboard-stats");
    return handleResponse<VendorDashboardStats>(res);
  },

  /**
   * Get administrative vendor audit logs
   */
  async getActivityLogs(): Promise<VendorActivityLog[]> {
    const res = await fetchWithAuth("/api/vendors/activity-logs");
    const data = await handleResponse<{ logs: VendorActivityLog[] } | VendorActivityLog[]>(res);
    return Array.isArray(data) ? data : (data.logs || []);
  },

  /**
   * Get vendor registrations list with optional search and status filter
   */
  async getRegistrations(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ vendors: Vendor[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "All") searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/vendors/registrations${qs ? `?${qs}` : ""}`);
    const data = await handleResponse<{ vendors: Vendor[]; pagination?: { total: number } } | Vendor[]>(res);
    
    if (Array.isArray(data)) {
      return { vendors: data, total: data.length };
    }
    return {
      vendors: data.vendors || [],
      total: data.pagination?.total || data.vendors?.length || 0,
    };
  },

  /**
   * Register a new vendor
   */
  async registerVendor(payload: RegisterVendorPayload): Promise<Vendor> {
    const res = await fetchWithAuth("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Vendor>(res);
  },

  /**
   * Get vendor by ID or slug
   */
  async getVendorById(id: string): Promise<Vendor> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}`);
    return handleResponse<Vendor>(res);
  },

  /**
   * Update vendor status (Approved, Rejected, Suspended, Inactive)
   */
  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<Vendor> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<Vendor>(res);
  },

  /**
   * Update vendor KYC status (Verified, Rejected, In Review)
   */
  async updateKycStatus(
    id: string,
    kycStatus: string,
    notes?: string
  ): Promise<Vendor> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}/kyc-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kycStatus, notes }),
    });
    return handleResponse<Vendor>(res);
  },

  /**
   * Update vendor commission rate
   */
  async updateCommission(id: string, commissionRate: number): Promise<Vendor> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}/commission`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionRate }),
    });
    return handleResponse<Vendor>(res);
  },

  /**
   * Update vendor bank & tax information
   */
  async updateBankTax(
    id: string,
    payload: { bankInfo?: Partial<VendorBankInfo>; taxInfo?: Partial<VendorTaxInfo> }
  ): Promise<Vendor> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}/bank-tax`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Vendor>(res);
  },

  /**
   * Soft-delete / deactivate vendor
   */
  async softDeleteVendor(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetchWithAuth(`/api/vendors/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /**
   * Upload vendor document (supports multipart FormData or metadata)
   */
  async uploadDocument(
    vendorId: string,
    formData: FormData
  ): Promise<VendorDocument> {
    const token = typeof window !== "undefined" ? localStorage.getItem("bloom-token") : null;
    const res = await fetch(`http://localhost:5000/api/vendors/${encodeURIComponent(vendorId)}/documents`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse<VendorDocument>(res);
  },

  /**
   * Verify vendor compliance document
   */
  async verifyDocument(
    vendorId: string,
    docId: string,
    status: string,
    notes?: string
  ): Promise<VendorDocument> {
    const res = await fetchWithAuth(
      `/api/vendors/${encodeURIComponent(vendorId)}/documents/${encodeURIComponent(docId)}/verify`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      }
    );
    return handleResponse<VendorDocument>(res);
  },

  /**
   * Remove vendor compliance document
   */
  async deleteDocument(
    vendorId: string,
    docId: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await fetchWithAuth(
      `/api/vendors/${encodeURIComponent(vendorId)}/documents/${encodeURIComponent(docId)}`,
      {
        method: "DELETE",
      }
    );
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  /**
   * Get vendor orders
   */
  async getOrders(vendorId?: string): Promise<VendorOrder[]> {
    const qs = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : "";
    const res = await fetchWithAuth(`/api/vendors/orders${qs}`);
    const data = await handleResponse<{ orders: VendorOrder[] } | VendorOrder[]>(res);
    return Array.isArray(data) ? data : (data.orders || []);
  },

  /**
   * Update vendor order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<VendorOrder> {
    const res = await fetchWithAuth(`/api/vendors/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return handleResponse<VendorOrder>(res);
  },

  /**
   * Get vendor settlements
   */
  async getSettlements(vendorId?: string): Promise<VendorSettlement[]> {
    const qs = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : "";
    const res = await fetchWithAuth(`/api/vendors/settlements${qs}`);
    const data = await handleResponse<{ settlements: VendorSettlement[] } | VendorSettlement[]>(res);
    return Array.isArray(data) ? data : (data.settlements || []);
  },

  /**
   * Generate vendor settlement
   */
  async generateSettlement(vendorId: string, period: string): Promise<VendorSettlement> {
    const res = await fetchWithAuth("/api/vendors/settlements/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, period }),
    });
    return handleResponse<VendorSettlement>(res);
  },

  /**
   * Approve vendor settlement
   */
  async approveSettlement(settlementId: string): Promise<{ settlement: VendorSettlement; payment: VendorPayment }> {
    const res = await fetchWithAuth(`/api/vendors/settlements/${encodeURIComponent(settlementId)}/approve`, {
      method: "PATCH",
    });
    return handleResponse<{ settlement: VendorSettlement; payment: VendorPayment }>(res);
  },

  /**
   * Process and disburse vendor payment
   */
  async processPayment(
    paymentId: string,
    payload: { referenceId: string; method?: string; notes?: string }
  ): Promise<{ payment: VendorPayment; settlement: VendorSettlement; transaction: VendorTransaction }> {
    const res = await fetchWithAuth(`/api/vendors/payments/${encodeURIComponent(paymentId)}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ payment: VendorPayment; settlement: VendorSettlement; transaction: VendorTransaction }>(res);
  },

  /**
   * Get vendor returns
   */
  async getReturns(vendorId?: string): Promise<VendorReturn[]> {
    const qs = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : "";
    const res = await fetchWithAuth(`/api/vendors/returns${qs}`);
    const data = await handleResponse<{ returns: VendorReturn[] } | VendorReturn[]>(res);
    return Array.isArray(data) ? data : (data.returns || []);
  },

  /**
   * Inspect vendor return
   */
  async inspectReturn(
    returnId: string,
    payload: { passed: boolean; notes?: string }
  ): Promise<VendorReturn> {
    const res = await fetchWithAuth(`/api/vendors/returns/${encodeURIComponent(returnId)}/inspect`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<VendorReturn>(res);
  },

  /**
   * Get vendor transactions ledger
   */
  async getTransactions(vendorId?: string): Promise<VendorTransaction[]> {
    const qs = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : "";
    const res = await fetchWithAuth(`/api/vendors/transactions${qs}`);
    const data = await handleResponse<{ transactions: VendorTransaction[] } | VendorTransaction[]>(res);
    return Array.isArray(data) ? data : (data.transactions || []);
  },
};
