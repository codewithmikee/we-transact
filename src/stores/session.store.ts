import { create } from "zustand";
import { UserResource, UserRole } from "@/types/api.types";

interface SessionState {
  user: UserResource | null;
  accessToken: string | null;
  tokenExpiresAt: string | null;
  /** UUID of the org a system admin is currently managing (null = system level) */
  activeOrgUuid: string | null;

  setSession: (data: {
    user: UserResource;
    accessToken: string;
    tokenExpiresAt: string;
  }) => void;
  setAccessToken: (token: string, expiresAt?: string) => void;
  setActiveOrg: (uuid: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  tokenExpiresAt: null,
  activeOrgUuid: null,

  setSession: ({ user, accessToken, tokenExpiresAt }) =>
    set({ user, accessToken, tokenExpiresAt }),

  setAccessToken: (accessToken, tokenExpiresAt) =>
    set((s) => ({
      accessToken,
      tokenExpiresAt: tokenExpiresAt ?? s.tokenExpiresAt,
    })),

  setActiveOrg: (activeOrgUuid) => set({ activeOrgUuid }),

  clearSession: () =>
    set({ user: null, accessToken: null, tokenExpiresAt: null, activeOrgUuid: null }),
}));

/** Stable selector — returns current user role without re-rendering on unrelated state changes */
export const selectUserRole = (s: SessionState): UserRole | null =>
  s.user?.role ?? null;
