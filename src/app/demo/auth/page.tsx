import { cookies } from "next/headers";
import { SystemAdminLayout } from "@/components/layout/SystemAdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ClientSessionStatus } from "@/components/auth/ClientSessionStatus";
import { parseSessionCookie } from "@/lib/api/cookies";
import { ORGANiZATION_USER_NAV_ITEMS, SYSTEM_ADMIN_NAV_ITEMS } from "@/lib/nav-configs/nav-items";

export const metadata = { title: "Auth Demo" };

/**
 * Phase 1 auth demo page — accessible at /demo/auth
 * Shows three sections:
 * 1. SSR: session cookie decoded server-side (no JS required)
 * 2. CSR: Zustand store state read client-side
 * 3. Role-based nav: nav configs with preventerUserRoles annotated
 */
export default async function AuthDemoPage() {
  // ── 1. SSR: read session cookie on the server ────────────────────────────
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("session")?.value ?? null;
  const rawExpiresAt = cookieStore.get("token_expires_at")?.value ?? null;
  const hasRefreshToken = !!cookieStore.get("refresh_token")?.value;
  const session = rawSession ? parseSessionCookie(rawSession) : null;

  return (
    <SystemAdminLayout>
      <PageHeader
        title="Phase 1 — Auth Demo"
        description="Session management: SSR cookie reading, CSR Zustand state, and role-based navigation."
        breadcrumbs={[
          { label: "Demo", href: "/demo" },
          { label: "Auth", isCurrent: true },
        ]}
      />

      <div className="space-y-8">
        {/* ── SSR Session ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Badge variant="info">SSR</Badge>
            Server-side session cookie
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-600 font-normal">
                Read by the server component before rendering — zero client JS involved.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                {[
                  ["session cookie", rawSession ? "present" : "missing"],
                  ["refresh_token cookie", hasRefreshToken ? "present (httpOnly)" : "missing"],
                  ["token_expires_at", rawExpiresAt ? new Date(rawExpiresAt).toLocaleString() : "missing"],
                  ["uuid", session?.uuid ?? "—"],
                  ["role", session?.role ?? "—"],
                  ["name", session?.name ?? "—"],
                  ["orgSlug", session?.orgSlug ?? "—"],
                  ["orgUuid", session?.orgUuid ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex px-3 py-2">
                    <span className="w-40 shrink-0 text-slate-500">{label}</span>
                    <span className={`font-mono break-all ${value === "missing" ? "text-red-400" : value === "present" || value === "present (httpOnly)" ? "text-emerald-600" : "text-slate-800"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── CSR Session ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Badge variant="warning">CSR</Badge>
            Client-side Zustand store
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-600 font-normal">
                Access token lives only in memory (Zustand). On page refresh, SessionProvider
                silently calls <code className="bg-slate-100 px-1 rounded">/api/auth/refresh</code> to rehydrate it.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientSessionStatus />
            </CardContent>
          </Card>
        </section>

        {/* ── Role-based Nav Demo ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Badge variant="secondary">Nav</Badge>
            Role-based navigation config
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Admin Nav</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {SYSTEM_ADMIN_NAV_ITEMS.map((item) => (
                    <li key={item.link} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                      <span className="text-slate-700">{item.title}</span>
                      <code className="ml-auto text-xs text-slate-400 font-mono">{item.link}</code>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Org Admin Nav</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ORGANiZATION_USER_NAV_ITEMS.map((item, i) => {
                    if ("items" in item) {
                      return (
                        <li key={i}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.title}</p>
                          <ul className="space-y-1 ml-2">
                            {item.items.map((sub) => (
                              <li key={sub.link} className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-slate-700">{sub.title}</span>
                                {sub.preventerUserRoles && (
                                  <Badge variant="warning" className="text-[10px] ml-1">
                                    hidden from: {sub.preventerUserRoles.join(", ")}
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      );
                    }
                    return (
                      <li key={item.link} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-slate-700">{item.title}</span>
                        {item.preventerUserRoles && (
                          <Badge variant="warning" className="text-[10px] ml-1">
                            hidden from: {item.preventerUserRoles.join(", ")}
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </SystemAdminLayout>
  );
}
