import { NextRequest, NextResponse } from "next/server";
import { parseSessionCookie } from "@/lib/api/cookies";

const SYSTEM_ROLES = ["sy_super_admin", "sy_admin"];
const ORG_ROLES = ["org_super_admin", "org_admin"];

async function getSession(req: NextRequest) {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  return parseSessionCookie(cookie);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);

  if (pathname === "/change-password") {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url),
      );
    }
  }

  // ── /system routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/system")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url),
      );
    }
    if (!SYSTEM_ROLES.includes(session.role)) {
      // Org user tried to hit system route — send them to their org
      if (session.orgSlug) {
        return NextResponse.redirect(
          new URL(`/org/${session.orgSlug}`, req.url),
        );
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ── /org routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/org")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url),
      );
    }
    // System admins can enter org routes (they manage orgs as org admins)
    const isAllowed =
      ORG_ROLES.includes(session.role) || SYSTEM_ROLES.includes(session.role);
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ── /login redirect for already-authenticated users ────────────────────────
  if (pathname === "/login" && session) {
    if (SYSTEM_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL("/system", req.url));
    }
    if (ORG_ROLES.includes(session.role) && session.orgSlug) {
      return NextResponse.redirect(
        new URL(`/org/${session.orgSlug}`, req.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/system/:path*", "/org/:path*", "/change-password", "/login"],
};
