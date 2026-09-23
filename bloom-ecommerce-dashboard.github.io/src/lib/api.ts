export const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") || "";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiUser {
  id: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  role: string;
  permissions?: string[] | undefined;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | undefined;
  data?: T | undefined;
  error?: string | undefined;
}

export interface AuthLoginData {
  token: string;
  user: ApiUser;
}

/**
 * Custom API Error class containing status code and server message
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthLoginData> {
    const url = `${API_BASE_URL}/api/auth/login`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to reach the server. Please check your network or backend connection.";
      throw new ApiError(
        message.includes("Failed to fetch")
          ? "Cannot connect to server at " + API_BASE_URL + ". Please ensure the backend is running."
          : message,
        0
      );
    }

    let result: ApiResponse<AuthLoginData>;
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        `Server returned an invalid response (${response.status} ${response.statusText})`,
        response.status
      );
    }

    if (!response.ok || !result.success || !result.data) {
      const message = result.message || "Login failed. Please check your credentials.";
      throw new ApiError(message, response.status, result);
    }

    return result.data;
  },

  /**
   * Fetch current authenticated user using Bearer token
   */
  async getMe(token: string): Promise<ApiUser> {
    const url = `${API_BASE_URL}/api/auth/me`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new ApiError("Session expired or invalid", response.status);
    }

    const result: ApiResponse<ApiUser> = await response.json();
    if (!result.success || !result.data) {
      throw new ApiError(result.message || "Failed to retrieve user profile", response.status);
    }

    return result.data;
  },
};

/**
 * Utility helper to make authenticated requests with token from localStorage
 */
export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response & { data?: any; success?: boolean; pagination?: any }> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("bloom-token") ||
        window.localStorage.getItem("accessToken") ||
        window.localStorage.getItem("token")
      : null;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  try {
    const clone = response.clone();
    const json = await clone.json();
    if (json && typeof json === "object") {
      Object.assign(response, json);
    }
  } catch {
    // Non-JSON or empty response (e.g., 204 or stream)
  }

  return response as any;
}
