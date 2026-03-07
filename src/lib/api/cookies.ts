/**
 * Shared cookie helpers used by BFF route handlers and middleware.
 *
 * The "session" cookie is a HMAC-SHA256-signed JWT (via jose).
 * It is NOT encrypted, but it IS cryptographically signed — any tampering
 * will cause verifySessionCookie() to return null.
 * The real auth protection remains: Bearer token in memory + httpOnly refresh_token cookie.
 *
 * Required env: SESSION_SECRET (>=32 chars). A dev fallback is used when unset,
 * but production deployments MUST set this variable.
 */
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

// Dev fallback — intentionally long to satisfy HS256 key length requirements.
// NEVER use this in production; always set SESSION_SECRET.
const DEV_FALLBACK =
  "dev-only-fallback-secret-not-for-production-use-at-all!!";

function getSigningKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (IS_PROD) {
      throw new Error(
        "[auth] SESSION_SECRET must be set in production. " +
          "Generate one with: openssl rand -hex 32",
      );
    }
    return new TextEncoder().encode(DEV_FALLBACK);
  }
  if (secret.length < 32) {
    throw new Error("[auth] SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

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

/** Returns a signed JWT string suitable for the "session" cookie. */
export async function buildSessionCookie(user: {
  id: string;
  role: string;
  name: string;
  organization?: { slug: string; id: string } | null;
}): Promise<string> {
  const payload: SessionPayload = {
    uuid: user.id,
    role: user.role,
    name: user.name,
    orgSlug: user.organization?.slug ?? null,
    orgUuid: user.organization?.id ?? null,
  };

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSigningKey());
}

/**
 * Verifies and decodes the signed session cookie.
 * Returns null if the value is missing, tampered, or expired.
 */
export async function parseSessionCookie(
  value: string,
): Promise<SessionPayload | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, getSigningKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("refresh_token");
  response.cookies.delete("session");
  response.cookies.delete("token_expires_at");
}
