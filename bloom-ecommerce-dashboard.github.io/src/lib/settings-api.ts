import { fetchWithAuth, ApiError } from "./api";
import type { Role, TeamUser, Notification } from "./bloom-settings";

export interface ProfileData {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  initials: string;
  email: string;
  role: string;
  roleScope: string;
  status: string;
  phone: string;
  location: string;
  timezone: string;
  warehouse: string;
  recoveryEmail: string;
  twoFactorEnabled: boolean;
  passwordChangedAgo: string;
  stats: Array<{
    label: string;
    value: string;
    icon: string;
    tone: string;
  }>;
  recentActivity: Array<{
    title: string;
    time: string;
  }>;
  activeSessions: Array<{
    id: string;
    device: string;
    place: string;
    time: string;
    current: boolean;
  }>;
}

export interface PreferencesData {
  storeDetails: {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    storefrontDomain: string;
  };
  regional: {
    currency: string;
    timezone: string;
    dateFormat: string;
    weightUnit: string;
  };
  notificationPreferences: {
    orders: boolean;
    stock: boolean;
    payouts: boolean;
    reviews: boolean;
    security: boolean;
  };
}

export interface IntegrationItem {
  id: string;
  key: string;
  name: string;
  category: string;
  status: "Connected" | "Not connected";
  detail: string;
  config?: Record<string, any>;
}

export interface UserListResponse {
  counts: Array<{
    label: string;
    value: number;
  }>;
  data: TeamUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
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

  return json.data as T;
}

export const settingsApi = {
  // ---------------------------------------------------
  // 1. Profile & Sessions
  // ---------------------------------------------------
  async getProfile(): Promise<ProfileData> {
    const res = await fetchWithAuth("/api/settings/profile");
    return handleResponse<ProfileData>(res);
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    recoveryEmail?: string;
  }): Promise<ProfileData> {
    const res = await fetchWithAuth("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<ProfileData>(res);
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await fetchWithAuth("/api/settings/profile/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string }>(res);
  },

  async deleteSession(sessionId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/settings/profile/sessions/${sessionId}`, {
      method: "DELETE",
    });
    return handleResponse<any>(res);
  },

  // ---------------------------------------------------
  // 2. Team Users
  // ---------------------------------------------------
  async listUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.role && params.role !== "All roles") searchParams.set("role", params.role);
    if (params?.status && params.status !== "All status") searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/settings/users${qs ? `?${qs}` : ""}`);
    return handleResponse<UserListResponse>(res);
  },

  async createUser(payload: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    warehouseName?: string;
    sendInvite?: boolean;
  }): Promise<TeamUser> {
    const res = await fetchWithAuth("/api/settings/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamUser>(res);
  },

  async updateUser(
    id: string,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      warehouseName?: string;
      status?: string;
    }
  ): Promise<TeamUser> {
    const res = await fetchWithAuth(`/api/settings/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<TeamUser>(res);
  },

  async setStatus(id: string, status: "Active" | "Suspended" | "Invited"): Promise<TeamUser> {
    const res = await fetchWithAuth(`/api/settings/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return handleResponse<TeamUser>(res);
  },

  async sendInvite(id: string): Promise<{ message: string }> {
    const res = await fetchWithAuth(`/api/settings/users/${id}/resend-invite`, {
      method: "POST",
    });
    return handleResponse<{ message: string }>(res);
  },

  async removeUser(id: string): Promise<{ message: string }> {
    const res = await fetchWithAuth(`/api/settings/users/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  // ---------------------------------------------------
  // 3. Roles & Permissions
  // ---------------------------------------------------
  async listRoles(): Promise<Role[]> {
    const res = await fetchWithAuth("/api/settings/roles");
    return handleResponse<Role[]>(res);
  },

  async getRole(id: string): Promise<Role> {
    const res = await fetchWithAuth(`/api/settings/roles/${id}`);
    return handleResponse<Role>(res);
  },

  async addRole(payload: {
    name: string;
    description: string;
    scope?: string;
    modulePermissions?: Record<string, string[]>;
  }): Promise<Role> {
    const res = await fetchWithAuth("/api/settings/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Role>(res);
  },

  async editRole(
    id: string,
    payload: {
      name?: string;
      description?: string;
      scope?: string;
      modulePermissions?: Record<string, string[]>;
    }
  ): Promise<Role> {
    const res = await fetchWithAuth(`/api/settings/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<Role>(res);
  },

  async removeRole(id: string): Promise<{ message: string }> {
    const res = await fetchWithAuth(`/api/settings/roles/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  // ---------------------------------------------------
  // 4. Preferences & Store Settings
  // ---------------------------------------------------
  async getPreferences(): Promise<PreferencesData> {
    const res = await fetchWithAuth("/api/settings/preferences");
    return handleResponse<PreferencesData>(res);
  },

  async savePreferences(payload: Partial<PreferencesData>): Promise<PreferencesData> {
    const res = await fetchWithAuth("/api/settings/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<PreferencesData>(res);
  },

  // ---------------------------------------------------
  // 5. Notifications
  // ---------------------------------------------------
  async listNotifications(params?: {
    search?: string;
    type?: string;
    priority?: string;
    read?: string;
  }): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type && params.type !== "All") searchParams.set("type", params.type);
    if (params?.priority && params.priority !== "All") searchParams.set("priority", params.priority);
    if (params?.read !== undefined) searchParams.set("read", params.read);

    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/api/settings/notifications${qs ? `?${qs}` : ""}`);
    return handleResponse<NotificationListResponse>(res);
  },

  async markAllRead(): Promise<{ message: string }> {
    const res = await fetchWithAuth("/api/settings/notifications/mark-all-read", {
      method: "PATCH",
    });
    return handleResponse<{ message: string }>(res);
  },

  async getNotification(id: string): Promise<Notification> {
    const res = await fetchWithAuth(`/api/settings/notifications/${id}`);
    return handleResponse<Notification>(res);
  },

  async toggleNotificationRead(id: string, read: boolean): Promise<Notification> {
    const res = await fetchWithAuth(`/api/settings/notifications/${id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    return handleResponse<Notification>(res);
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const res = await fetchWithAuth(`/api/settings/notifications/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  // ---------------------------------------------------
  // 6. Integrations
  // ---------------------------------------------------
  async listIntegrations(): Promise<IntegrationItem[]> {
    const res = await fetchWithAuth("/api/settings/integrations");
    return handleResponse<IntegrationItem[]>(res);
  },

  async toggleIntegration(id: string): Promise<IntegrationItem> {
    const res = await fetchWithAuth(`/api/settings/integrations/${id}/toggle`, {
      method: "PATCH",
    });
    return handleResponse<IntegrationItem>(res);
  },

  async configureIntegration(
    id: string,
    payload: { detail?: string; config?: Record<string, any>; status?: string }
  ): Promise<IntegrationItem> {
    const res = await fetchWithAuth(`/api/settings/integrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<IntegrationItem>(res);
  },
};
