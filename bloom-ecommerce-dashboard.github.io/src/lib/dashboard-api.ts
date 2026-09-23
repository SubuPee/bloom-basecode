import { fetchWithAuth, ApiError } from "./api";

export interface DashboardStat {
  label: string;
  value: string;
  raw: number;
  trend: string;
  up: boolean;
  tone: string;
}

export interface CategorySplitItem {
  name: string;
  count: number;
  percentage: number;
  tone: string;
}

export interface StatusSplit {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export interface RecentProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  price: string;
  rawPrice: number;
  status: string;
  image: string;
}

export interface OrdersSummary {
  totalOrders: number;
  awaitingConfirmation: number;
}

export interface DashboardOverviewData {
  stats: DashboardStat[];
  productsByCategory: CategorySplitItem[];
  statusSplit: StatusSplit;
  recentProducts: RecentProduct[];
  ordersSummary: OrdersSummary;
}

export const dashboardApi = {
  /**
   * Complete executive dashboard overview
   */
  async getOverview(): Promise<DashboardOverviewData> {
    const res = await fetchWithAuth<{ success: boolean; data: DashboardOverviewData }>("/api/dashboard/overview");
    return res.data;
  },

  /**
   * Top 4 KPI metric cards with trends
   */
  async getStats(): Promise<DashboardStat[]> {
    const res = await fetchWithAuth<{ success: boolean; data: DashboardStat[] }>("/api/dashboard/stats");
    return res.data;
  },

  /**
   * Products by category distribution
   */
  async getCategorySplit(): Promise<CategorySplitItem[]> {
    const res = await fetchWithAuth<{ success: boolean; data: CategorySplitItem[] }>("/api/dashboard/category-split");
    return res.data;
  },

  /**
   * Recently added products to catalog
   */
  async getRecentProducts(limit: number = 6): Promise<RecentProduct[]> {
    const res = await fetchWithAuth<{ success: boolean; data: RecentProduct[] }>(
      `/api/dashboard/recent-products?limit=${limit}`
    );
    return res.data;
  },
};
