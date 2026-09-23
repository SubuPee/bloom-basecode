import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type ApiUser } from "@/lib/api";

export type User = {
  id?: string | undefined;
  name: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email: string;
  role: string;
  permissions: string[];
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function formatApiUser(apiUser: Partial<ApiUser>): User {
  const firstName = apiUser.firstName || "";
  const lastName = apiUser.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const fallbackName = apiUser.email
    ? apiUser.email
        .split("@")[0]
        ?.replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin"
    : "Administrator";

  return {
    id: apiUser.id,
    name: fullName || fallbackName,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email || "",
    role: apiUser.role || "Administrator",
    permissions: apiUser.permissions || [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage and optionally verify session
  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? window.localStorage.getItem("bloom-token") : null;
    const savedUser = typeof window !== "undefined" ? window.localStorage.getItem("bloom-user") : null;

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser) as User);
        } catch {
          window.localStorage.removeItem("bloom-user");
        }
      }

      // Revalidate in background with backend
      authApi
        .getMe(savedToken)
        .then((freshApiUser) => {
          const formatted = formatApiUser(freshApiUser);
          setUser(formatted);
          window.localStorage.setItem("bloom-user", JSON.stringify(formatted));
        })
        .catch((err) => {
          console.warn("Session revalidation failed:", err.message);
          // If token is invalid or expired, clean up
          if (err.status === 401 || err.status === 403) {
            window.localStorage.removeItem("bloom-token");
            window.localStorage.removeItem("bloom-user");
            setUser(null);
            setToken(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login: async (email: string, password?: string) => {
        if (!password) {
          throw new Error("Password is required to sign in.");
        }

        const data = await authApi.login({ email, password });
        const nextUser = formatApiUser(data.user);

        window.localStorage.setItem("bloom-token", data.token);
        window.localStorage.setItem("bloom-user", JSON.stringify(nextUser));

        setToken(data.token);
        setUser(nextUser);
      },
      logout: () => {
        window.localStorage.removeItem("bloom-token");
        window.localStorage.removeItem("bloom-user");
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider missing");
  return value;
}
