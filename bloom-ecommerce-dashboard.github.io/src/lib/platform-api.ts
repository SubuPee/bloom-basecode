import { fetchWithAuth } from "./api";
import type { Txn, Offer } from "./bloom-b2c";

export interface PlatformKpi {
  label: string;
  value: string;
  delta: string;
  iconName: string;
  tone: string;
}

export interface PlatformOverviewData {
  kpis: PlatformKpi[];
  recentTransactions: Txn[];
  activeOffers: Offer[];
  recentReviews: ReviewItem[];
  recentTickets: TicketItem[];
  counts: {
    pendingReviews: number;
    openTickets: number;
    liveOffers: number;
    lowStockProducts: number;
  };
}

export interface ReviewItem {
  id: string;
  _id?: string;
  product: string;
  customer: string;
  rating: number;
  text: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export interface TicketItem {
  id: string;
  _id?: string;
  subject: string;
  customer: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In progress" | "Resolved" | "Closed";
  age?: string;
  channel?: string;
}

export interface PayoutItem {
  id: string;
  _id?: string;
  period: string;
  gross: number;
  fees: number;
  refunds: number;
  net: number;
  status: string;
  bank: string;
}

export interface RefundItem {
  id: string;
  _id?: string;
  order: string;
  customer: string;
  amount: number;
  reason: string;
  status: string;
  date: string;
}

export interface ShippingZoneItem {
  zone: string;
  rate: string;
  eta: string;
  partners: string;
}

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "All" && v !== "All status" && v !== "All methods") {
      sp.set(k, String(v));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

export const platformApi = {
  // 1. Overview
  async getOverview(): Promise<PlatformOverviewData> {
    const res = await fetchWithAuth<{ success: boolean; data: PlatformOverviewData }>("/api/platform/overview");
    return res.data;
  },

  // 2. Offers & Coupons
  async getOffers(params?: { tab?: string; search?: string }): Promise<Offer[]> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: Offer[] }>(`/api/platform/offers${qs}`);
    return res.data;
  },

  async getOfferById(id: string): Promise<Offer> {
    const res = await fetchWithAuth<{ success: boolean; data: Offer }>(`/api/platform/offers/${id}`);
    return res.data;
  },

  async createOffer(payload: Partial<Offer>): Promise<Offer> {
    const res = await fetchWithAuth<{ success: boolean; data: Offer }>("/api/platform/offers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateOffer(id: string, payload: Partial<Offer>): Promise<Offer> {
    const res = await fetchWithAuth<{ success: boolean; data: Offer }>(`/api/platform/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteOffer(id: string): Promise<{ success: boolean }> {
    const res = await fetchWithAuth<{ success: boolean }>(`/api/platform/offers/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  // 3. Payments, Payouts & Refunds
  async getTransactions(params?: { status?: string; method?: string; search?: string }): Promise<Txn[]> {
    const qs = buildQueryString(params);
    const res = await fetchWithAuth<{ success: boolean; data: Txn[] }>(`/api/platform/payments/transactions${qs}`);
    return res.data;
  },

  async getPayouts(): Promise<PayoutItem[]> {
    const res = await fetchWithAuth<{ success: boolean; data: PayoutItem[] }>("/api/platform/payments/payouts");
    return res.data;
  },

  async getRefunds(): Promise<RefundItem[]> {
    const res = await fetchWithAuth<{ success: boolean; data: RefundItem[] }>("/api/platform/payments/refunds");
    return res.data;
  },

  // 4. Reviews Moderation
  async getReviews(status?: string): Promise<ReviewItem[]> {
    const qs = buildQueryString({ status });
    const res = await fetchWithAuth<{ success: boolean; data: ReviewItem[] }>(`/api/platform/reviews${qs}`);
    return res.data;
  },

  async createReview(payload: { product: string; customer: string; rating: number; text: string }): Promise<ReviewItem> {
    const res = await fetchWithAuth<{ success: boolean; data: ReviewItem }>("/api/platform/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateReviewStatus(id: string, status: "Approved" | "Rejected" | "Pending"): Promise<ReviewItem> {
    const res = await fetchWithAuth<{ success: boolean; data: ReviewItem }>(`/api/platform/reviews/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async deleteReview(id: string): Promise<{ success: boolean }> {
    const res = await fetchWithAuth<{ success: boolean }>(`/api/platform/reviews/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  // 5. Support Tickets
  async getTickets(status?: string): Promise<TicketItem[]> {
    const qs = buildQueryString({ status });
    const res = await fetchWithAuth<{ success: boolean; data: TicketItem[] }>(`/api/platform/tickets${qs}`);
    return res.data;
  },

  async createTicket(payload: { subject: string; customer: string; priority?: string; channel?: string }): Promise<TicketItem> {
    const res = await fetchWithAuth<{ success: boolean; data: TicketItem }>("/api/platform/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateTicketStatus(id: string, status: "Open" | "In progress" | "Resolved" | "Closed"): Promise<TicketItem> {
    const res = await fetchWithAuth<{ success: boolean; data: TicketItem }>(`/api/platform/tickets/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async deleteTicket(id: string): Promise<{ success: boolean }> {
    const res = await fetchWithAuth<{ success: boolean }>(`/api/platform/tickets/${id}`, {
      method: "DELETE",
    });
    return res;
  },

  // 6. Shipping Zones
  async getShippingZones(): Promise<ShippingZoneItem[]> {
    const res = await fetchWithAuth<{ success: boolean; data: ShippingZoneItem[] }>("/api/platform/shipping-zones");
    return res.data;
  },

  async updateShippingZones(zones: ShippingZoneItem[]): Promise<ShippingZoneItem[]> {
    const res = await fetchWithAuth<{ success: boolean; data: ShippingZoneItem[] }>("/api/platform/shipping-zones", {
      method: "PUT",
      body: JSON.stringify({ zones }),
    });
    return res.data;
  },
};
