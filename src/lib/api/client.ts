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
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attaches Bearer token and injects ?organization_uuid for system admins
// who have selected an org context.
apiClient.interceptors.request.use((config) => {
  const { accessToken, user, activeOrgUuid } = useSessionStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const isSystemAdmin =
    user?.role === "sy_super_admin" || user?.role === "sy_admin";
  if (isSystemAdmin && activeOrgUuid) {
    config.params = { ...config.params, organization_uuid: activeOrgUuid };
  }

  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401 → silent refresh → retry queued requests.
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
          config.headers!.Authorization = `Bearer ${token}`;
          return apiClient(config);
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) throw new Error("Refresh failed");
        const { accessToken } = await res.json();
        useSessionStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);
        config.headers!.Authorization = `Bearer ${accessToken}`;
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
