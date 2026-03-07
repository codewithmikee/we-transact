import { create } from "zustand";
import { UserResource, UserRole } from "@/types/api.types";

const ACTIVE_ORG_KEY = "activeOrgUuid";

interface SessionState {
  user: UserResource | null;
  accessToken: string | null;
  tokenExpiresAt: string | null;
  /** UUID of the org a system admin is currently managing (null = system level) */
  activeOrgUuid: string | null;
  /** True once initial auth bootstrap has completed (we know if user is logged in or not). */
  isSessionReady: boolean;

  setSession: (data: {
    user: UserResource;
    accessToken: string;
    tokenExpiresAt: string;
  }) => void;
  setAccessToken: (token: string, expiresAt?: string) => void;
  setActiveOrg: (uuid: string | null) => void;
  clearSession: () => void;
  markSessionReady: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  tokenExpiresAt: null,
  // Persist across page refreshes via sessionStorage (cleared when tab closes)
  activeOrgUuid:
    typeof window !== "undefined"
      ? sessionStorage.getItem(ACTIVE_ORG_KEY)
      : null,
  isSessionReady: false,

  setSession: ({ user, accessToken, tokenExpiresAt }) =>
    set({ user, accessToken, tokenExpiresAt }),

  setAccessToken: (accessToken, tokenExpiresAt) =>
    set((s) => ({
      accessToken,
      tokenExpiresAt: tokenExpiresAt ?? s.tokenExpiresAt,
    })),

  setActiveOrg: (activeOrgUuid) => {
    if (typeof window !== "undefined") {
      if (activeOrgUuid) {
        sessionStorage.setItem(ACTIVE_ORG_KEY, activeOrgUuid);
      } else {
        sessionStorage.removeItem(ACTIVE_ORG_KEY);
      }
    }
    set({ activeOrgUuid });
  },

  clearSession: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACTIVE_ORG_KEY);
    }
    set({
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      activeOrgUuid: null,
      isSessionReady: true,
    });
  },

  markSessionReady: () =>
    set({
      isSessionReady: true,
    }),
}));

/** Stable selector — returns current user role without re-rendering on unrelated state changes */
export const selectUserRole = (s: SessionState): UserRole | null =>
  s.user?.role ?? null;
