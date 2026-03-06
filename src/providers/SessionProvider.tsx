"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/session.store";
import { refreshApi } from "@/lib/api/auth";

/**
 * Mounts at the root layout (client boundary).
 *
 * Responsibilities:
 * 1. Bootstrap: on first client render, if no access token is in Zustand memory,
 *    calls /api/auth/refresh to rehydrate from the httpOnly refresh_token cookie.
 * 2. Proactive refresh: schedules a silent re-refresh 60 s before the token expires
 *    so the user is never interrupted by a 401.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = (tokenExpiresAt: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = Math.max(
      5_000,
      new Date(tokenExpiresAt).getTime() - Date.now() - 60_000,
    );
    timerRef.current = setTimeout(doRefresh, delay);
  };

  const doRefresh = async () => {
    const data = await refreshApi();
    if (!data) {
      // Refresh token expired — clear state and let middleware handle redirect
      useSessionStore.getState().clearSession();
      return;
    }
    useSessionStore.getState().setSession({
      user: data.user,
      accessToken: data.accessToken,
      tokenExpiresAt: data.tokenExpiresAt,
    });
    scheduleRefresh(data.tokenExpiresAt);
  };

  useEffect(() => {
    const { accessToken } = useSessionStore.getState();

    if (!accessToken) {
      // No token in memory (page refresh or first load) — try to rehydrate
      doRefresh();
    } else {
      // Token already in memory — schedule refresh based on the public cookie
      const expiresAtCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token_expires_at="))
        ?.split("=")
        .slice(1)
        .join("=");

      if (expiresAtCookie) {
        scheduleRefresh(decodeURIComponent(expiresAtCookie));
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
