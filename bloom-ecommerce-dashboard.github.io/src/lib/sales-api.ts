import { fetchWithAuth, ApiError } from "./api";

export interface SalesMetricStat {
  id: string;
  label: string;
  value: string;
  rawAmount: number;
  trend: string;
  up: boolean;
  tone: string;
  detail: string;
}

export interface RevenueBarPoint {
  index: number;
  heightPercent: number;
  amount: number;
  formattedAmount: string;
}

export interface RevenueOverview {
  title: string;
  subtitle: string;
  bars: number[];
  points: RevenueBarPoint[];
  labels: string[];
}

export interface SalesChannel {
  name: string;
  amount: number;
  formattedAmount: string;
  share: string;
  percentage: number;
  tone: string;
}

export interface TopProduct {
  rank: number;
  name: string;
  unitsSold: number;
  soldText: string;
  revenue: number;
  formattedRevenue: string;
}

export interface CustomerMix {
  totalCustomers: string;
  rawTotal: number;
  returning: {
    count: number;
    percentage: number;
    label: string;
    tone: string;
  };
  new: {
    count: number;
    percentage: number;
    label: string;
    tone: string;
  };
}

export interface SalesOverviewData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  stats: SalesMetricStat[];
  revenueOverview: RevenueOverview;
  channels: SalesChannel[];
  channelsTuples: Array<[string, string, string, string]>;
  topProducts: TopProduct[];
  topProductsTuples: Array<[string, string, string]>;
  customerMix: CustomerMix;
}

export interface SalesTransaction {
  transactionId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  formattedDate: string;
  channel: string;
  grossAmount: number;
  discount: number;
  tax: number;
  netRevenue: number;
  formattedNetRevenue: string;
  paymentStatus: string;
  orderStatus: string;
}

export const salesApi = {
  /**
   * Complete sales performance overview
   */
  async getOverview(period: string = "this_month"): Promise<SalesOverviewData> {
    const res = await fetchWithAuth<{ success: boolean; data: SalesOverviewData }>(
      `/api/admin/sales/overview?period=${encodeURIComponent(period)}`
    );
    return res.data;
  },

  /**
   * Top 4 financial KPI metric cards
   */
  async getMetrics(period: string = "this_month"): Promise<{ stats: SalesMetricStat[] }> {
    const res = await fetchWithAuth<{ success: boolean; data: { stats: SalesMetricStat[] } }>(
      `/api/admin/sales/metrics?period=${encodeURIComponent(period)}`
    );
    return res.data;
  },

  /**
   * Revenue time-series bars and chart data
   */
  async getChart(interval: string = "daily", period: string = "this_month"): Promise<{ revenueOverview: RevenueOverview }> {
    const res = await fetchWithAuth<{ success: boolean; data: { revenueOverview: RevenueOverview } }>(
      `/api/admin/sales/chart?interval=${encodeURIComponent(interval)}&period=${encodeURIComponent(period)}`
    );
    return res.data;
  },

  /**
   * Sales breakdown by sales channel
   */
  async getChannels(): Promise<{ channels: SalesChannel[]; channelsTuples: Array<[string, string, string, string]> }> {
    const res = await fetchWithAuth<{
      success: boolean;
      data: { channels: SalesChannel[]; channelsTuples: Array<[string, string, string, string]> };
    }>("/api/admin/sales/channels");
    return res.data;
  },

  /**
   * Best selling products by revenue and quantity
   */
  async getTopProducts(): Promise<{ topProducts: TopProduct[]; topProductsTuples: Array<[string, string, string]> }> {
    const res = await fetchWithAuth<{
      success: boolean;
      data: { topProducts: TopProduct[]; topProductsTuples: Array<[string, string, string]> };
    }>("/api/admin/sales/top-products");
    return res.data;
  },

  /**
   * Customer mix (new vs returning distribution)
   */
  async getCustomerMix(): Promise<CustomerMix> {
    const res = await fetchWithAuth<{ success: boolean; data: CustomerMix }>("/api/admin/sales/customer-mix");
    return res.data;
  },

  /**
   * Paginated sales transactions ledger
   */
  async getTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: SalesTransaction[]; pagination: { total: number; page: number; limit: number } }> {
    const res = await fetchWithAuth<{
      success: boolean;
      data: SalesTransaction[];
      pagination: { total: number; page: number; limit: number };
    }>(`/api/admin/sales/transactions?page=${page}&limit=${limit}`);
    return {
      transactions: res.data || [],
      pagination: res.pagination || { total: 0, page, limit },
    };
  },

  /**
   * Export sales report to CSV or JSON
   */
  async exportReport(format: "csv" | "json" = "csv"): Promise<void> {
    const token = localStorage.getItem("accessToken") || "";
    const url = `/api/admin/sales/export?format=${format}`;

    if (format === "csv") {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export sales CSV");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `bloom-sales-report-${Date.now()}.csv`;
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
      a.download = `bloom-sales-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    }
  },
};
