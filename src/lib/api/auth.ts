/**
 * Client-side auth functions.
 * These call Next.js BFF route handlers, not breeze-api directly.
 * The BFF handlers set/clear httpOnly cookies for refresh_token and session.
 */
import { UserResource } from "@/types/api.types";

export interface LoginRequest {
  user_name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenExpiresAt: string;
  user: UserResource;
}

export interface ApiAuthError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
}

export async function loginApi(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Object.assign(new Error(data.message ?? "Login failed"), {
      status: res.status,
      data,
    });
  }

  return data as AuthResponse;
}

export async function logoutApi(accessToken: string): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
}

export async function refreshApi(): Promise<AuthResponse | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  if (!res.ok) return null;
  return res.json() as Promise<AuthResponse>;
}
