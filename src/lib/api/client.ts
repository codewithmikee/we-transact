/**
 * Axios client for direct browser → breeze-api data requests.
 * Auth requests go through Next.js route handlers (/api/auth/*) instead.
 *
 * Do not import this in Server Components or route handlers — use plain fetch there.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/stores/session.store";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ── Shared bootstrap singleton ────────────────────────────────────────────────
// Prevents SessionProvider and the 401 interceptor from calling /api/auth/refresh
// concurrently (which breaks rotating refresh tokens).
let _bootstrapPromise: Promise<string | null> | null = null;

export function bootstrapSession(): Promise<string | null> {
  // If token already in memory, return immediately
  const existing = useSessionStore.getState().accessToken;
  if (existing) return Promise.resolve(existing);

  // Reuse in-flight promise to prevent concurrent refresh calls
  if (_bootstrapPromise) return _bootstrapPromise;

  _bootstrapPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) {
        useSessionStore.getState().clearSession();
        return null;
      }
      const data = await res.json();
      useSessionStore.getState().setSession({
        user: data.user,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
      });
      return data.accessToken as string;
    } catch {
      useSessionStore.getState().clearSession();
      return null;
    }
  })();

  // Reset after 2 s so future proactive refreshes can create a new promise
  _bootstrapPromise.finally(() => {
    setTimeout(() => {
      _bootstrapPromise = null;
    }, 2000);
  });

  return _bootstrapPromise;
}

// ── Request interceptor ──────────────────────────────────────────────────────
// Attaches Bearer token and injects ?organization_uuid whenever an org context
// is active (works for both org admins and system admins managing an org).
apiClient.interceptors.request.use((config) => {
  const { accessToken, activeOrgUuid, user } = useSessionStore.getState();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Only inject organization_uuid if:
  // 1. An org is active
  // 2. The user is a system admin (org admins context is handled by their token)
  const isSystemAdmin = user?.role === "sy_super_admin" || user?.role === "sy_admin";
  if (activeOrgUuid && isSystemAdmin) {
    config.params = { ...config.params, organization_uuid: activeOrgUuid };
  }

  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401 → shared bootstrap refresh → retry queued requests.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && config && !config._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          config.headers.set("Authorization", `Bearer ${token}`);
          return apiClient(config);
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const token = await bootstrapSession();
        if (!token) throw new Error("Refresh failed");
        processQueue(null, token);
        config.headers.set("Authorization", `Bearer ${token}`);
        return apiClient(config);
      } catch (err) {
        processQueue(err, null);
        useSessionStore.getState().clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
