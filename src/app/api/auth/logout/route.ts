import { NextRequest, NextResponse } from "next/server";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";
import { clearAuthCookies } from "@/lib/api/cookies";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json().catch(() => ({ accessToken: null }));

  // Best-effort: revoke the access token on the backend
  if (accessToken) {
    await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }).catch(() => {
      // Ignore — we still clear cookies regardless
    });
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
