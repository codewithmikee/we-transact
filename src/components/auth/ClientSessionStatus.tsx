"use client";

import { useSessionStore } from "@/stores/session.store";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle } from "lucide-react";

const ROLE_COLORS: Record<string, "info" | "success" | "warning" | "secondary"> = {
  sy_super_admin: "info",
  sy_admin: "info",
  org_super_admin: "success",
  org_admin: "success",
};

export function ClientSessionStatus() {
  const { user, accessToken, tokenExpiresAt } = useSessionStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {accessToken ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
        <span className="text-sm font-medium text-slate-700">
          Access token in memory:{" "}
          <span className={accessToken ? "text-emerald-600" : "text-red-500"}>
            {accessToken ? "present" : "absent"}
          </span>
        </span>
      </div>

      {accessToken && (
        <div className="rounded-md bg-slate-50 border border-slate-200 p-3 font-mono text-xs text-slate-600 break-all">
          {accessToken.slice(0, 40)}…
        </div>
      )}

      {tokenExpiresAt && (
        <p className="text-xs text-slate-500">
          Expires: <span className="font-mono">{new Date(tokenExpiresAt).toLocaleString()}</span>
        </p>
      )}

      {user ? (
        <div className="rounded-md border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">User (Zustand)</span>
            <Badge variant={ROLE_COLORS[user.role] ?? "secondary"}>{user.role}</Badge>
          </div>
          {[
            ["UUID", user.id],
            ["Name", user.name],
            ["Username", user.user_name],
            ["Email", user.email],
            ["Active", user.is_active ? "yes" : "no"],
            ...(user.organization
              ? [
                  ["Org Name", user.organization.name],
                  ["Org Slug", user.organization.slug],
                  ["Org UUID", user.organization.id],
                ]
              : []),
          ].map(([label, value]) => (
            <div key={label} className="flex px-3 py-2 text-xs">
              <span className="w-28 shrink-0 text-slate-500">{label}</span>
              <span className="font-mono text-slate-800 break-all">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">No user in store — session not loaded yet.</p>
      )}
    </div>
  );
}
