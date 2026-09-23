import { fetchWithAuth, ApiError } from "./api";

export interface CmsEntry {
  id: string;
  _id?: string;
  title: string;
  type: string;
  status: "Published" | "Draft" | "Archived";
  author: string;
  placement: string;
  summary: string;
  body?: string;
  visibility?: string;
  version?: number;
  updated: string;
  created?: string;
  slug?: string;
  tags?: string[];
  heroConfig?: {
    ctaText?: string;
    ctaLink?: string;
    badgeText?: string;
    backgroundTone?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CmsStats {
  publishedPages: string;
  activeCampaigns: string;
  reusableSections: string;
  stats?: Array<{
    label: string;
    value: string;
    icon: string;
    tone: string;
  }>;
  statsTuples?: Array<[string, string, string, string]>;
}

export interface CmsListResponse {
  items: CmsEntry[];
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateCmsPayload {
  title: string;
  type?: string;
  status?: "Published" | "Draft" | "Archived";
  author?: string;
  placement?: string;
  summary?: string;
  body?: string;
}

export interface UpdateCmsPayload {
  title?: string;
  type?: string;
  status?: "Published" | "Draft" | "Archived";
  author?: string;
  placement?: string;
  summary?: string;
  body?: string;
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

export const cmsApi = {
  /**
   * Fetch overview stats for KPI cards
   */
  async getStats(): Promise<CmsStats> {
    const res = await fetchWithAuth("/api/cms/stats");
    return handleResponse<CmsStats>(res);
  },

  /**
   * Fetch paginated CMS entries with search and filter parameters
   */
  async getEntries(params?: {
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: CmsEntry[]; totalCount: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type && params.type !== "All content types") searchParams.set("type", params.type);
    if (params?.status && params.status !== "All statuses") searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/cms${qs ? `?${qs}` : ""}`);
    
    let json: any;
    try {
      json = await res.json();
    } catch {
      throw new ApiError(`Server returned an invalid response (${res.status})`, res.status);
    }

    if (!res.ok || json.success === false) {
      throw new ApiError(json.message || "Failed to fetch CMS entries", res.status, json);
    }

    return {
      items: (json.data || []) as CmsEntry[],
      totalCount: json.pagination?.totalCount || (json.data?.length ?? 0),
    };
  },

  /**
   * Fetch a single CMS entry by ID or slug
   */
  async getEntryById(idOrSlug: string): Promise<CmsEntry> {
    const res = await fetchWithAuth(`/api/cms/${encodeURIComponent(idOrSlug)}`);
    return handleResponse<CmsEntry>(res);
  },

  /**
   * Create a new CMS entry
   */
  async createEntry(payload: CreateCmsPayload): Promise<CmsEntry> {
    const res = await fetchWithAuth("/api/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<CmsEntry>(res);
  },

  /**
   * Update an existing CMS entry
   */
  async updateEntry(idOrSlug: string, payload: UpdateCmsPayload): Promise<CmsEntry> {
    const res = await fetchWithAuth(`/api/cms/${encodeURIComponent(idOrSlug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<CmsEntry>(res);
  },

  /**
   * Delete a CMS entry
   */
  async deleteEntry(idOrSlug: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetchWithAuth(`/api/cms/${encodeURIComponent(idOrSlug)}`, {
      method: "DELETE",
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },
};
