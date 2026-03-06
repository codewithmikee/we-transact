import { NextRequest, NextResponse } from "next/server";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";
import { buildSessionCookie, COOKIE_OPTS, COOKIE_OPTS_PUBLIC } from "@/lib/api/cookies";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const { token, refresh_token, token_expires_at, user } = data;

  const response = NextResponse.json({
    accessToken: token,
    tokenExpiresAt: token_expires_at,
    user,
  });

  // httpOnly — not readable by JS
  response.cookies.set("refresh_token", refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // httpOnly — used by middleware for routing decisions only.
  // NOTE: this cookie is base64-encoded JSON, NOT cryptographically signed.
  // The real auth protection is the Bearer token in memory + the httpOnly refresh_token.
  // For production, consider signing this with iron-session or jose.
  response.cookies.set("session", buildSessionCookie(user), {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  });

  // Readable by JS — client uses this to schedule a proactive refresh
  response.cookies.set("token_expires_at", token_expires_at, {
    ...COOKIE_OPTS_PUBLIC,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
