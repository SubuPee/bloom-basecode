import { fetchWithAuth, ApiError } from "./api";

export interface ReportsOverviewKpis {
  totalSales: number;
  totalCommission: number;
  totalOrdersCount: number;
  totalInventoryUnits: number;
  totalProducedUnits: number;
  totalSettledAmount: number;
  totalRefundAmount: number;
}

export interface ReportsOverviewData {
  kpis: ReportsOverviewKpis;
  ordersCount: number;
  settlementsCount: number;
  productionsCount: number;
}

export interface ReportQueryParams {
  search?: string;
  vendorId?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedReportResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "All") {
      sp.set(k, String(v));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

export const reportsApi = {
  /**
   * Executive reports overview & ecosystem KPIs
   */
  async getOverview(params?: { vendorId?: string; dateRange?: string }): Promise<ReportsOverviewData> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: ReportsOverviewData }>(`/api/reports/overview${qs}`);
    return res.data;
  },

  /**
   * Vendor sales and GMV ledger
   */
  async getSalesReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/sales${qs}`);
    return res.data;
  },

  /**
   * Vendor orders and fulfillment status report
   */
  async getOrdersReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/orders${qs}`);
    return res.data;
  },

  /**
   * Inventory stock valuation and allocation report
   */
  async getInventoryReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/inventory${qs}`);
    return res.data;
  },

  /**
   * Production output and QA inspection report
   */
  async getProductionReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/production${qs}`);
    return res.data;
  },

  /**
   * Financial transactions ledger across escrow and platform wallets
   */
  async getTransactionsReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/transactions${qs}`);
    return res.data;
  },

  /**
   * Vendor settlements and payouts report
   */
  async getSettlementsReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/settlements${qs}`);
    return res.data;
  },

  /**
   * Customer returns and restock disposition report
   */
  async getReturnsReport(params?: ReportQueryParams): Promise<PaginatedReportResponse> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: PaginatedReportResponse }>(`/api/reports/returns${qs}`);
    return res.data;
  },

  /**
   * Export report data as CSV or JSON file download
   */
  async exportReport(
    category: string = "overview",
    params?: { vendorId?: string; dateRange?: string; search?: string; format?: "csv" | "json" }
  ): Promise<void> {
    const token = localStorage.getItem("accessToken") || "";
    const format = params?.format || "csv";
    const qs = buildQueryString({ ...params, category, format });
    const url = `/api/reports/export${qs}`;

    if (format === "csv") {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export report CSV");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `bloom-${category}-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } else {
      const res = await fetchWithAuth<{ success: boolean; data: any }>(url);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `bloom-${category}-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    }
  },
};
