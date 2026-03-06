"use client";

/**
 * useUser — convenience wrapper around the Zustand session store.
 * Maintains the same interface as the original context-based hook
 * so existing component code continues to work unchanged.
 */
import { useSessionStore } from "@/stores/session.store";
import { UserResource, UserRole } from "@/types/api.types";

interface UserContextType {
  user: UserResource | null;
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  setUser: (user: UserResource | null) => void;
}

export function useUser(): UserContextType {
  const user = useSessionStore((s) => s.user);
  const setSession = useSessionStore((s) => s.setSession);
  const accessToken = useSessionStore((s) => s.accessToken);
  const tokenExpiresAt = useSessionStore((s) => s.tokenExpiresAt);

  return {
    user,
    role: user?.role ?? null,
    setUser: (newUser) => {
      if (newUser && accessToken && tokenExpiresAt) {
        setSession({ user: newUser, accessToken, tokenExpiresAt });
      }
    },
    // Role is derived from user.role — this setter is a no-op kept for API compatibility.
    // Role is set by the backend; do not override it client-side.
    setRole: () => {},
  };
}

// Re-export UserProvider as a no-op wrapper for backward compatibility.
// SessionProvider in the root layout handles bootstrapping.
export function UserProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
