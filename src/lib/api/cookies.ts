/**
 * Shared cookie helpers used by BFF route handlers.
 */
import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export const COOKIE_OPTS_PUBLIC = {
  httpOnly: false,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export interface SessionPayload {
  uuid: string;
  role: string;
  name: string;
  orgSlug: string | null;
  orgUuid: string | null;
}

export function buildSessionCookie(user: {
  id: string;
  role: string;
  name: string;
  organization?: { slug: string; id: string } | null;
}): string {
  const payload: SessionPayload = {
    uuid: user.id,
    role: user.role,
    name: user.name,
    orgSlug: user.organization?.slug ?? null,
    orgUuid: user.organization?.id ?? null,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function parseSessionCookie(value: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, "base64").toString()) as SessionPayload;
  } catch {
    return null;
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("refresh_token");
  response.cookies.delete("session");
  response.cookies.delete("token_expires_at");
}
