import { NextRequest, NextResponse } from "next/server";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";
import {
  buildSessionCookie,
  clearAuthCookies,
  COOKIE_OPTS,
  COOKIE_OPTS_PUBLIC,
} from "@/lib/api/cookies";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!upstream.ok) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const data = await upstream.json();
  const { token, refresh_token, token_expires_at, user } = data;

  const response = NextResponse.json({
    accessToken: token,
    tokenExpiresAt: token_expires_at,
    user,
  });

  response.cookies.set("refresh_token", refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("session", await buildSessionCookie(user), {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("token_expires_at", token_expires_at, {
    ...COOKIE_OPTS_PUBLIC,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
